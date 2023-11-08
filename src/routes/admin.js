const express = require("express");
const router = express.Router();
const login = require("../middlewares/isLogin");

const AdminController = require("../controllers/admin");
const adminController = new AdminController();

router.get("/category", adminController.adminCate); // 카테고리 항목 조회
router.post("/artist", login.isLogin, adminController.creatArtist); // 작가 생성
router.post("/post", login.isLogin, adminController.creatPost); // 편지지 생성

module.exports = router;
