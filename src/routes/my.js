const express = require("express");
const router = express.Router();
const login = require("../middlewares/isLogin");

const MyController = require("../controllers/my");
const myController = new MyController();

router.get("/letterCnt", login.isLogin, myController.getLetterCnt); // 서랍 받은 편지함 카운트
router.get("/letterTmpCnt", login.isLogin, myController.getLetterTmpCnt); // 서랍 임시저장 목록 카운트
router.get("/postWishCnt", login.isLogin, myController.getPostWishCnt); // 찜목록 카운트
router.get("/heartTemper", login.isLogin, myController.getHeartTemper); // 내 마음온도
router.put("/changeNickname", login.isLogin, myController.changeNickname); // 닉네임 변경

module.exports = router;
