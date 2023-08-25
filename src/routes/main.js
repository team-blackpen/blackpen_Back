const express = require("express");
const router = express.Router();
const login = require("../middlewares/isLogin");

const MainController = require("../controllers/main");
const mainController = new MainController();

router.get("/listCnt", login.isLogin, mainController.getLetterListCnt); // 메인 새로운 편지 카운트 조회
router.get("/tmpList", login.isLogin, mainController.getLetterTmpList); // 메인 임시편지 리스트 3개 조회

module.exports = router;
