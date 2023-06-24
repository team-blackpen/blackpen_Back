const express = require("express");
const router = express.Router();
const login = require("../middlewares/isLogin");

const LetterController = require("../controllers/letter");
const letterController = new LetterController();

router.post("/", login.isLogin, letterController.creatLetter);

module.exports = router;
