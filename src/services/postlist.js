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
}

module.exports = PostListService;
