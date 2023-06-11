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

  getAllPost = async (req, res, next) => {
    try {
      const allPost = await this.postListService.getAllPost();

      const data = { postList: allPost };

      res.status(200).json({ result: 0, msg: "편지지 전체 조회", data });
    } catch {}
  };

  getPostWish = async (req, res, next) => {
    try {
      const userNo = 1; // 나중에 유저 정보 받아서 넣을 예정
      const allPostWish = await this.postListService.getPostWish(userNo);

      const data = { postWishList: allPostWish };

      res.status(200).json({ result: 0, msg: "편지지 찜목록 조회", data });
    } catch {}
  };

  getPostCategory = async (req, res, next) => {
    try {
      const cateNo = req.params.post_cate_no;
      let pageNum = req.query.page;
      const limit = 5;

      if (pageNum > 1) pageNum = limit * (pageNum - 1) + 1;

      const allPostCategory = await this.postListService.getPostCategory(cateNo, pageNum, limit);

      const data = { postCategoryList: allPostCategory };

      res.status(200).json({ result: 0, msg: "카테고리별 편지지 조회", data });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
}

module.exports = PostListController;
