const express = require("express");
const router = express.Router();

const PostListController = require("../controllers/postlist");
const postListController = new PostListController();

router.get("/category", postListController.getCategory);
router.get("/", postListController.getAllPost);
router.get("/wish", postListController.getPostWish);
router.get("/category/:post_cate_no", postListController.getPostCategory);

module.exports = router;
