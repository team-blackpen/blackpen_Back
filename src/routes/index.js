const express = require("express");
const router = express.Router();

const mainRouter = require("./main");
const postRouter = require("./post");

router.use("/main", mainRouter);
router.use("/post", postRouter);

module.exports = router;
