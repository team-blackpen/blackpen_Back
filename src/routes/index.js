const express = require("express");
const router = express.Router();

const authRouter = require("./auth");
const postListRouter = require("./postlist");
const postRouter = require("./post");
const adminRouter = require("./admin");

router.use("/auth", authRouter);
router.use("/postList", postListRouter);
router.use("/post", postRouter);
router.use("/admin", adminRouter);

module.exports = router;
