const express = require("express");
const router = express.Router();

const PostListController = require("../controllers/postList");
const postListController = new PostListController();

router.get("/banner", postListController.getBanner);
router.get("/category", postListController.getCategory);

module.exports = router;
