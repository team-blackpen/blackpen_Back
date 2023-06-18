const express = require("express");
const router = express.Router();

const PostController = require("../controllers/post");
const postController = new PostController();

router.get("/detail/:post_no", postController.getPostDetail);

module.exports = router;
