const express = require("express");
const router = express.Router();
const login = require("../middlewares/isLogin");

const PostController = require("../controllers/post");
const postController = new PostController();

router.get("/detail/:post_no", login.loginCheck, postController.getPostDetail); // 편지지 상세페이지

module.exports = router;
