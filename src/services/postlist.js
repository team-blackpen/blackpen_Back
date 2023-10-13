const dayjs = require("dayjs");
const ErrorCustom = require("../middlewares/errorCustom");

const PostListRepository = require("../repositories/postlist");

class PostListService {
  postListRepository = new PostListRepository();

  getCategory = async () => {
    try {
      const allCategory = await this.postListRepository.allCategory();

      return allCategory;
    } catch (err) {
      if (err.code == 400) throw err;
      throw new ErrorCustom(400, "카테고리 리스트 조회 실패");
    }
  };

  getAllPost = async () => {
    try {
      let allPost = [];

      const cateNo = await this.postListRepository.allCateNo();

      for (let i in cateNo) {
        const postObj = await this.postListRepository.allPost(cateNo[i].post_cate_no);
        let posts = postObj.posts;

        if (posts.length > 0) {
          for (let j in posts) {
            const hashs = await this.postListRepository.allHash(posts[j].post_no);

            hashs.length > 0 ? (posts[j].hashtag = hashs) : (posts[j].hashtag = []);
          }

          allPost.push(posts);
        }
      }

      return allPost;
    } catch (err) {
      if (err.code == 400) throw err;
      throw new ErrorCustom(400, "편지지 전체 조회 실패");
    }
  };

  getPostCategory = async (cateNo, limit, offset) => {
    try {
      let allPostCategory = {};

      const postObj = await this.postListRepository.allPost(cateNo, limit, offset);
      let posts = postObj.posts;
      posts.sort(() => Math.random() - 0.5);

      if (posts.length > 0) {
        for (let i in posts) {
          const hashs = await this.postListRepository.allHash(posts[i].post_no);

          hashs.length > 0 ? (posts[i].hashtag = hashs) : (posts[i].hashtag = []);
        }

        allPostCategory.postCateList = posts;
        allPostCategory.cateTitle = posts[0].cate_title;
        allPostCategory.nextData = postObj.nextData;

        return allPostCategory;
      }

      return allPostCategory;
    } catch (err) {
      if (err.code == 400) throw err;
      throw new ErrorCustom(400, "카테고리별 편지지 조회 실패");
    }
  };

  insPostWish = async (userNo, postNo) => {
    try {
      const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

      const insPostWish = await this.postListRepository.insPostWish(userNo, postNo, now);

      return insPostWish;
    } catch (err) {
      if (err.code == 400) throw err;
      throw new ErrorCustom(400, "편지지 찜목록 등록/삭제 실패");
    }
  };

  getPostWish = async (userNo) => {
    try {
      const allPostWish = await this.postListRepository.allPostWish(userNo);

      return allPostWish;
    } catch (err) {
      if (err.code == 400) throw err;
      throw new ErrorCustom(400, "편지지 찜목록 조회 실패");
    }
  };

  getPostWishCate = async (userNo) => {
    try {
      const allPostWishCate = await this.postListRepository.allCategory(userNo);

      return allPostWishCate;
    } catch (err) {
      if (err.code == 400) throw err;
      throw new ErrorCustom(400, "편지지 찜목록 카테고리 조회 실패");
    }
  };

  getPostWishListCate = async (userNo, cateNo) => {
    try {
      const posts = await this.postListRepository.allPostWishListCate(userNo, cateNo);

      if (posts.length > 0) {
        for (let i in posts) {
          const hashs = await this.postListRepository.allHash(posts[i].post_no);

          hashs.length > 0 ? (posts[i].hashtag = hashs) : (posts[i].hashtag = []);
        }
      }

      return posts;
    } catch (err) {
      if (err.code == 400) throw err;
      throw new ErrorCustom(400, "편지지 찜목록 보관함 조회 실패");
    }
  };
}

module.exports = PostListService;
