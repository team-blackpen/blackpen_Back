const express = require("express");
const router = express.Router();
const login = require("../middlewares/isLogin");

const LetterController = require("../controllers/letter");
const letterController = new LetterController();

router.post("/", login.isLogin, letterController.creatLetter);
router.get("/list", login.isLogin, letterController.getLetterList);
router.get("/tmp/list", login.isLogin, letterController.getLetterTmpList);
router.delete("/list", login.isLogin, letterController.deleteLetter);
router.delete("/tmp/list", login.isLogin, letterController.deleteLetterTmp);
router.get("/", login.isLogin, letterController.getLetter);

module.exports = router;
