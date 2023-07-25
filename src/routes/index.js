const express = require("express");
const router = express.Router();

const authRouter = require("./auth");
const postListRouter = require("./postlist");
const postRouter = require("./post");
const letterRouter = require("./letter");
const mainRouter = require("./main");
const myRouter = require("./my");
const adminRouter = require("./admin");

router.use("/auth", authRouter);
router.use("/postList", postListRouter);
router.use("/post", postRouter);
router.use("/letter", letterRouter);
router.use("/main", mainRouter);
router.use("/my", myRouter);
router.use("/admin", adminRouter);

module.exports = router;
