const express = require("express");
const router = express.Router();
const login = require("../middlewares/isLogin");

const PostListController = require("../controllers/postlist");
const postListController = new PostListController();

router.get("/category", postListController.getCategory); // 카테고리 항목 조회
router.get("/", postListController.getAllPost); // 모든 편지지 10개씩 조회
router.get("/category/:post_cate_no", postListController.getPostCategory); // 편지지 카테고리별 조회
router.post("/wish", login.isLogin, postListController.insPostWish); // 찜 등록, 취소
router.get("/wish", login.isLogin, postListController.getPostWish); // 찜 등록한 편지지 모두 조회
router.get("/wish/cate", login.isLogin, postListController.getPostWishCate); // 찜목록에 내가 찜한 편지지의 카테고리 항목 조회
router.get("/wish/list/:post_cate_no", login.isLogin, postListController.getPostWishListCate); // 찜목록 카테고리별 조회

module.exports = router;
