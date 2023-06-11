const express = require("express");
const router = express.Router();

const PostListController = require("../controllers/postlist");
const postListController = new PostListController();

router.get("/banner", postListController.getBanner);
router.get("/category", postListController.getCategory);
router.get("/", postListController.getAllPost);
router.get("/wish", postListController.getPostWish);

module.exports = router;
