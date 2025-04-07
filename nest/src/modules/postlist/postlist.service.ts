import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import * as dayjs from 'dayjs';

import { PostCategory } from './interfaces/post-category.interface';
import { PostItem } from './interfaces/post-item.interface';
import { Hashtag } from './interfaces/hashtag.interface';
import { PostListGroup } from './interfaces/post-list-group.interface';
import { PostWish } from './interfaces/post-wish.interface';

@Injectable()
export class PostlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategory(): Promise<PostCategory[]> {
    return await this.getAllCategory();
  }

  private async getAllCategory(userNo?: number): Promise<PostCategory[]> {
    const query = `
      SELECT 
        C.post_cate_no, C.cate_title, C.view_seq 
      FROM tb_post_cate C 
      JOIN tb_post_cate_rel Pcr ON C.post_cate_no = Pcr.post_cate_no 
      JOIN tb_post P ON P.post_no = Pcr.post_no AND P.status = 1 
      ${userNo ? 'JOIN tb_post_wish Pw ON Pw.post_no = Pcr.post_no AND Pw.user_no = ?' : ''} 
      WHERE 
        C.status = 1 
      GROUP BY Pcr.post_cate_no 
      ORDER BY C.view_seq;
    `;

    return userNo
      ? await this.prisma.$queryRawUnsafe<PostCategory[]>(query, userNo)
      : await this.prisma.$queryRawUnsafe<PostCategory[]>(query);
  }

  async getAllPost(): Promise<{ postList: PostListGroup[] }> {
    const allPost: { posts: PostItem[]; nextData: number }[] = [];

    const categoryList: { post_cate_no: number }[] =
      await this.getAllCategoryNos();

    for (const { post_cate_no } of categoryList) {
      const { posts, nextData } = await this.getPostsByCategory(post_cate_no);
      const postObj = {
        posts,
        nextData,
      };

      for (const post of posts) {
        const hashtags = await this.getHashtagsByPost(post.post_no);
        post.hashtag = hashtags ?? [];
      }

      if (posts.length > 0) {
        allPost.push(postObj);
      }
    }

    return { postList: allPost };
  }

  private async getAllCategoryNos(): Promise<{ post_cate_no: number }[]> {
    return await this.prisma.tb_post_cate.findMany({
      where: { status: 1 },
      select: { post_cate_no: true },
      orderBy: { view_seq: 'asc' },
    });
  }

  private async getPostsByCategory(
    cateNo: number,
    limit?: number,
    offset?: number,
  ): Promise<{ posts: PostItem[]; nextData: number }> {
    const take = limit ?? 10;
    const skip = offset ?? 0;

    const posts: PostItem[] = await this.prisma.$queryRaw`
      SELECT 
        P.post_no, P.post_title, P.post_description, 
        Pi.post_img_no, Pi.img_url,
        Pc.post_cate_no, Pc.cate_title, 
        A.artist_no, A.artist_name 
      FROM tb_post P 
      JOIN tb_post_img Pi ON Pi.post_no = P.post_no AND Pi.view_seq = 0 
      JOIN tb_post_cate_rel Pcr ON Pcr.post_no = P.post_no AND Pcr.status = 1 
      JOIN tb_post_cate Pc ON Pc.post_cate_no = Pcr.post_cate_no AND Pc.post_cate_no = ${cateNo} 
      JOIN tb_post_artist_rel Ar ON Ar.post_no = P.post_no 
      JOIN tb_artist A ON A.artist_no = Ar.artist_no 
      WHERE 
        P.status = 1 
      ORDER BY P.reg_dt DESC, Pc.view_seq, Pcr.view_seq 
      LIMIT ${take} OFFSET ${skip};
    `;

    let nextData = 0;

    if (limit !== undefined && offset !== undefined) {
      const nextCheck: any[] = await this.prisma.$queryRaw`
        SELECT 
          P.post_no 
        FROM tb_post P 
        JOIN tb_post_img Pi ON Pi.post_no = P.post_no 
        JOIN tb_post_cate_rel Pcr ON Pcr.post_no = P.post_no 
        JOIN tb_post_cate Pc ON Pc.post_cate_no = Pcr.post_cate_no 
        WHERE 
          P.status = 1 
          AND Pc.post_cate_no = ${cateNo} 
          AND Pi.view_seq = 0 
        LIMIT 1 OFFSET ${skip + take};
      `;

      nextData = nextCheck.length > 0 ? 1 : 0;
    }

    return { posts, nextData };
  }

  private async getHashtagsByPost(postNo: number): Promise<Hashtag[]> {
    return await this.prisma.tb_post_hashtag.findMany({
      where: {
        post_no: postNo,
        status: 1,
      },
      select: {
        post_hashtag_no: true,
        hashtag_title: true,
      },
      orderBy: { view_seq: 'asc' },
      take: 2,
    });
  }

  async getPostCategory(
    cateNo: number,
    limit: number,
    offset: number,
  ): Promise<{
    cate_title: string;
    postCategoryList: PostItem[];
    nextData: number;
  }> {
    const { posts, nextData } = await this.getPostsByCategory(
      cateNo,
      limit,
      offset,
    );

    if (posts.length === 0) {
      return {
        cate_title: '',
        postCategoryList: [],
        nextData: 0,
      };
    }

    // 카테리가 new가 아닐 때만 랜덤 정렬
    if (cateNo !== 1) {
      posts.sort(() => Math.random() - 0.5);
    }

    for (const post of posts) {
      const hashtags = await this.getHashtagsByPost(post.post_no);
      post.hashtag = hashtags ?? [];
    }

    return {
      cate_title: posts[0].cate_title,
      postCategoryList: posts,
      nextData,
    };
  }

  async getPostWish(userNo: number): Promise<PostWish[]> {
    return await this.prisma.tb_post_wish.findMany({
      where: {
        user_no: userNo,
        status: 1,
      },
      select: {
        user_no: true,
        post_no: true,
      },
      orderBy: {
        post_no: 'asc',
      },
    });
  }

  async getPostWishCate(userNo: number): Promise<PostCategory[]> {
    return await this.getAllCategory(userNo);
  }

  async getPostWishListCate(
    userNo: number,
    cateNo: number,
  ): Promise<PostItem[]> {
    const posts = await this.getPostWishListByCategory(userNo, cateNo);

    for (const post of posts) {
      const hashtags = await this.getHashtagsByPost(post.post_no);
      post.hashtag = hashtags ?? [];
    }

    return posts;
  }

  private async getPostWishListByCategory(
    userNo: number,
    cateNo: number,
  ): Promise<PostItem[]> {
    let addCateNo = '';
    let params: (number | string)[] = [userNo];

    if (cateNo !== 0) {
      addCateNo = `AND Pc.post_cate_no = ?`;
      params.push(cateNo);
    }

    const query = `
      SELECT 
        P.post_no, P.post_title, P.post_description, 
        Pi.post_img_no, Pi.img_url, 
        Pc.post_cate_no, Pc.cate_title, 
        A.artist_no, A.artist_name, 
        IF(Pw.upt_dt, Pw.upt_dt, Pw.reg_dt) AS upt_dt
      FROM tb_post P 
      JOIN tb_post_img Pi ON Pi.post_no = P.post_no AND Pi.view_seq = 0 
      JOIN tb_post_cate_rel Pcr ON Pcr.post_no = P.post_no 
      JOIN tb_post_cate Pc ON Pc.post_cate_no = Pcr.post_cate_no AND Pc.status = 1 
      JOIN tb_post_artist_rel Ar ON Ar.post_no = P.post_no 
      JOIN tb_artist A ON A.artist_no = Ar.artist_no 
      JOIN tb_post_wish Pw ON Pw.post_no = P.post_no AND Pw.user_no = ?
      WHERE 
        P.status = 1 
        ${addCateNo}
      GROUP BY P.post_no 
      ORDER BY upt_dt DESC;
    `;

    return await this.prisma.$queryRawUnsafe<PostItem[]>(query, ...params);
  }

  async insPostWish(
    userNo: number,
    postNo: number,
  ): Promise<{ userNo: number; postNo: number; msg: string }> {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    return await this.togglePostWish(userNo, postNo, now);
  }

  private async togglePostWish(
    userNo: number,
    postNo: number,
    now: string,
  ): Promise<{ userNo: number; postNo: number; msg: string }> {
    return await this.prisma.$transaction(async (tx) => {
      const existing = await tx.tb_post_wish.findFirst({
        where: { user_no: userNo, post_no: postNo },
      });

      if (!existing) {
        await tx.tb_post_wish.create({
          data: {
            user_no: userNo,
            post_no: postNo,
            status: 1,
            reg_dt: new Date(),
          },
        });
        return { userNo, postNo, msg: '편지지 찜목록 등록' };
      }

      const newStatus = existing.status === 1 ? 0 : 1;

      await tx.tb_post_wish.update({
        where: { post_wish_no: existing.post_wish_no },
        data: {
          status: newStatus,
          upt_dt: new Date(),
        },
      });

      const msg = newStatus === 1 ? '편지지 찜목록 등록' : '편지지 찜목록 삭제';

      return { userNo, postNo, msg };
    });
  }
}
