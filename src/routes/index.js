const express = require("express");
const router = express.Router();

const authRouter = require("./auth");
const postListRouter = require("./postlist");
const templateRouter = require("./template");
const adminRouter = require("./admin");
// const postRouter = require("./post");

router.use("/auth", authRouter);
router.use("/postList", postListRouter);
router.use("/template", templateRouter);
router.use("/admin", adminRouter);
// router.use("/post", postRouter);

module.exports = router;
