const express = require("express");
const router = express.Router();
const login = require("../middlewares/isLogin");

const MainController = require("../controllers/main");
const mainController = new MainController();

router.get("/listCnt", login.isLogin, mainController.getLetterListCnt); // 메인 새로운 편지 카운트 조회
router.get("/tmpList", login.isLogin, mainController.getLetterTmpList); // 메인 임시편지 리스트 3개 조회
router.get("/quote", mainController.getQuote); // 메인 글귀 랜덤 조회
router.get("/quoteList", mainController.getQuoteList); // 메인 글귀 리스트 조회
router.get("/anniversary", mainController.getAnniversary); // 메인 기념일 조회
router.post("/gift", login.loginCheck, mainController.postGift); // 메인 선물하기 로그 수집
router.post("/visit", mainController.visitLog); // 방문기록 로그 수집

module.exports = router;
