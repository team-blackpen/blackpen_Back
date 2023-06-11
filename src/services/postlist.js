const dayjs = require("dayjs");

const PostListRepository = require("../repositories/postlist");

class PostListService {
  postListRepository = new PostListRepository();

  getBanner = async () => {
    const today = dayjs().format("YYYYMMDD");

    const allBanner = await this.postListRepository.allBanner(today);

    return allBanner;
  };

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

  getPostCategory = async (cateNo, pageNum, limit) => {
    let allPost = [];

    const posts = await this.postListRepository.allPost(cateNo, pageNum, limit);

    if (posts.length > 0) {
      for (let i in posts) {
        const hashs = await this.postListRepository.allHash(posts[i].post_no);

        hashs.length > 0 ? (posts[i].hashtag = hashs) : (posts[i].hashtag = []);
      }

      allPost.push(posts);
    }

    return allPost;
  };
}

module.exports = PostListService;
