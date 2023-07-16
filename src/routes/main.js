const express = require("express");
const router = express.Router();
const login = require("../middlewares/isLogin");

const MainController = require("../controllers/main");
const mainController = new MainController();

router.get("/listCnt", login.isLogin, mainController.getLetterListCnt);
router.get("/tmpList", login.isLogin, mainController.getLetterTmpList);

module.exports = router;
