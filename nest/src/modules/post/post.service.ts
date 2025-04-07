import { Injectable, BadRequestException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { PostDetail } from './interfaces/post-detail.interface';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async getPostDetail(
    userNo: number | undefined,
    postNo: number,
  ): Promise<PostDetail> {
    const post = await this.getPostDetailMain(userNo, postNo);

    if (!post) {
      throw new BadRequestException('존재하지 않는 편지지입니다');
    }

    post.wish = Number(post.wish);
    post.hashtag = await this.getPostDetailEtc(postNo, 'hashtag');
    post.post_img = await this.getPostDetailEtc(postNo, 'postImg');
    post.post_detail_img = await this.getPostDetailEtc(postNo, 'postDetailImg');
    post.post_preview_img = await this.getPostDetailEtc(
      postNo,
      'postPreviewImg',
    );

    return post;
  }

  private async getPostDetailMain(userNo: number | undefined, postNo: number) {
    const addWish = userNo ? 'IFNULL(Pw.status, 0) AS wish,' : '0 AS wish,';
    const joinWish = userNo
      ? 'LEFT JOIN tb_post_wish Pw ON Pw.post_no = P.post_no AND Pw.user_no = ?'
      : '';

    const query = `
        SELECT 
            P.post_no, P.post_title, P.post_description, 
            ${addWish}
            A.artist_no, A.artist_name
        FROM tb_post P 
        JOIN tb_post_artist_rel Ar ON Ar.post_no = P.post_no 
        JOIN tb_artist A ON A.artist_no = Ar.artist_no 
        ${joinWish}
        WHERE 
            P.post_no = ? AND P.status = 1;
    `;

    const params = userNo ? [userNo, postNo] : [postNo];
    const result = await this.prisma.$queryRawUnsafe<PostDetail[]>(
      query,
      ...params,
    );

    return result[0] ?? null;
  }

  private async getPostDetailEtc(
    postNo: number,
    type: 'hashtag' | 'postImg' | 'postDetailImg' | 'postPreviewImg',
  ): Promise<any[]> {
    const map = {
      hashtag: {
        table: 'tb_post_hashtag',
        pk: 'post_hashtag_no',
        query: `
            SELECT 
                Ph.post_hashtag_no, Ph.hashtag_title
            FROM tb_post P
            JOIN tb_post_hashtag Ph ON Ph.post_no = P.post_no AND Ph.status = 1
            WHERE 
                P.post_no = ? 
                AND P.status IN (1, 2, 3)
            ORDER BY Ph.view_seq;
            `,
      },
      postImg: {
        table: 'tb_post_img',
        pk: 'post_img_no',
        query: `
            SELECT 
                Pi.post_img_no, Pi.img_url
            FROM tb_post P
            JOIN tb_post_img Pi ON Pi.post_no = P.post_no AND Pi.status = 1
            WHERE 
                P.post_no = ? 
                AND P.status IN (1, 2, 3)
            ORDER BY Pi.view_seq;
            `,
      },
      postDetailImg: {
        table: 'tb_post_detail_img',
        pk: 'post_detail_img_no',
        query: `
            SELECT 
                Pdi.post_detail_img_no, Pdi.img_url
            FROM tb_post P
            JOIN tb_post_detail_img Pdi ON Pdi.post_no = P.post_no AND Pdi.status = 1
            WHERE 
                P.post_no = ? 
                AND P.status IN (1, 2, 3)
            ORDER BY Pdi.view_seq;
            `,
      },
      postPreviewImg: {
        table: 'tb_post_preview_img',
        pk: 'post_preview_img_no',
        query: `
            SELECT 
                Ppi.post_preview_img_no, Ppi.img_url
            FROM tb_post P
            JOIN tb_post_preview_img Ppi ON Ppi.post_no = P.post_no AND Ppi.status = 1
            WHERE 
                P.post_no = ? 
                AND P.status IN (1, 2, 3)
            ORDER BY Ppi.view_seq;
            `,
      },
    };

    const selected = map[type];
    return await this.prisma.$queryRawUnsafe<any[]>(selected.query, postNo);
  }
}
