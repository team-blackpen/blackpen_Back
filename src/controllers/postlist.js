const express = require("express");
const app = express();

const PostListService = require("../services/postlist");

class PostListController {
  postListService = new PostListService();

  getBanner = async (req, res, next) => {
    try {
      const allBanner = await this.postListService.getBanner();

      const data = { banner: allBanner };

      res.status(200).json({ result: 0, msg: "광고 배너 조회", data });
    } catch {}
  };

  getCategory = async (req, res, next) => {
    try {
      const allCategory = await this.postListService.getCategory();

      const data = { categoryList: allCategory };

      res.status(200).json({ result: 0, msg: "카테고리 리스트 조회", data });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
}

module.exports = PostListController;
