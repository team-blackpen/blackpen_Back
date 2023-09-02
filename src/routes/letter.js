const express = require("express");
const router = express.Router();
const login = require("../middlewares/isLogin");

const LetterController = require("../controllers/letter");
const letterController = new LetterController();

router.post("/", login.isLogin, letterController.creatLetter); // 편지 생성
router.get("/list", login.isLogin, letterController.getLetterList); // 편지보관함 조회
router.get("/tmp/list", login.isLogin, letterController.getLetterTmpList); // 임시편지 보관함 조회
router.delete("/list", login.isLogin, letterController.deleteLetter); // 편지 삭제
router.delete("/tmp/list", login.isLogin, letterController.deleteLetterTmp); // 임시편지 삭제
router.get("/", login.isLogin, letterController.getLetter); // 편지 수신
router.get("/guest/:hash_letter", letterController.getLetterHash); // 게스트 편지 수신
router.post("/thank", login.isLogin, letterController.postThankMsg); // 감동 메세지 보내기
router.get("/tmp/:letter_no", login.isLogin, letterController.getLetterTmp); // 임시편지 불러오기
router.get("/font", letterController.getFont); // 폰트 조회

module.exports = router;
