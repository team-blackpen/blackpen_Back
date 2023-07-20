const dayjs = require("dayjs");

const PostListRepository = require("../repositories/postlist");

class PostListService {
  postListRepository = new PostListRepository();

  getCategory = async () => {
    const allCategory = await this.postListRepository.allCategory();

    return allCategory;
  };

  getAllPost = async () => {
    let allPost = [];

    const cateNo = await this.postListRepository.allCateNo();

    for (let i in cateNo) {
      const posts = await this.postListRepository.allPost(cateNo[i].post_cate_no);
      if (posts.length > 0) {
        for (let j in posts) {
          const hashs = await this.postListRepository.allHash(posts[j].post_no);

          hashs.length > 0 ? (posts[j].hashtag = hashs) : (posts[j].hashtag = []);
        }

        allPost.push(posts);
      }
    }

    return allPost;
  };

  getPostWish = async (userNo) => {
    const allPostWish = await this.postListRepository.allPostWish(userNo);

    return allPostWish;
  };

  getPostCategory = async (cateNo, limit, offset) => {
    let allPostCategory = {};

    const posts = await this.postListRepository.allPost(cateNo, limit, offset);

    if (posts.length > 0) {
      for (let i in posts) {
        const hashs = await this.postListRepository.allHash(posts[i].post_no);

        hashs.length > 0 ? (posts[i].hashtag = hashs) : (posts[i].hashtag = []);
      }

      allPostCategory.postCateList = posts;
      allPostCategory.cateTitle = posts[0].cate_title;

      return allPostCategory;
    }

    return allPostCategory;
  };

  insPostWish = async (userNo, postNo) => {
    const now = dayjs().format("YYYY-MM-DD hh:mm:ss");

    const insPostWish = await this.postListRepository.insPostWish(userNo, postNo, now);

    return insPostWish;
  };

  getPostWishList = async (userNo, cateNo) => {
    const posts = await this.postListRepository.allPostWishList(userNo, cateNo);

    if (posts.length > 0) {
      for (let i in posts) {
        const hashs = await this.postListRepository.allHash(posts[i].post_no);

        hashs.length > 0 ? (posts[i].hashtag = hashs) : (posts[i].hashtag = []);
      }
    }

    return posts;
  };
}

module.exports = PostListService;
