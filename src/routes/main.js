const express = require("express");
const router = express.Router();
const login = require("../middlewares/isLogin");

const MainController = require("../controllers/main");
const mainController = new MainController();

router.get("/listCnt", login.isLogin, mainController.getLetterListCnt);

module.exports = router;
