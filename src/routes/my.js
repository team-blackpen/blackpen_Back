const express = require("express");
const router = express.Router();
const login = require("../middlewares/isLogin");

const MyController = require("../controllers/my");
const myController = new MyController();

router.get("/letterCnt", login.isLogin, myController.getLetterCnt);
router.get("/letterTmpCnt", login.isLogin, myController.getLetterTmpCnt);
router.get("/postWishCnt", login.isLogin, myController.getPostWishCnt);
router.get("/heartTemper", login.isLogin, myController.getHeartTemper);

module.exports = router;
