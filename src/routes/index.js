const express = require("express");
const router = express.Router();

const authRouter = require("./auth");
const mainRouter = require("./main");
const templateRouter = require("./template");
// const postRouter = require("./post");

router.use("/auth", authRouter);
router.use("/main", mainRouter);
router.use("/template", templateRouter);
// router.use("/post", postRouter);

module.exports = router;
