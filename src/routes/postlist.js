const express = require("express");
const router = express.Router();
const login = require("../middlewares/isLogin");

const PostListController = require("../controllers/postlist");
const postListController = new PostListController();

router.get("/category", postListController.getCategory);
router.get("/", postListController.getAllPost);
router.get("/wish", login.isLogin, postListController.getPostWish);
router.get("/category/:post_cate_no", postListController.getPostCategory);
router.post("/wish", login.isLogin, postListController.insPostWish);

module.exports = router;
