require("dotenv").config();
const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

// 카카오로그인
const kakaoCallback = (req, res, next) => {
  try {
    passport.authenticate(
      "kakao",
      { failureRedirect: "/" }, // 실패하면 '/user/login''로 돌아감.
      async (err, user, info) => {
        if (err) return next(err);
        const { user_no, nickname, user_img_url } = user;
        let artist_no = "",
          artist_name = "";

        if (user.artist_no) {
          artist_no = user.artist_no;
          artist_name = user.artist_name;
        }

        const accessToken = jwt.sign({ user_no: user_no, nickname: nickname, user_img_url: user_img_url, artist_no: artist_no, artist_name: artist_name }, process.env.JWT_KEY, { expiresIn: "3h" });

        result = { user_no, accessToken, nickname, user_img_url, artist_no, artist_name };
        res.status(200).json({ result: 0, msg: "카카오 성공", data: result });
      }
    )(req, res, next);
  } catch (error) {
    next(error);
  }
};

// 로그인페이지로 이동
router.get("/kakao", passport.authenticate("kakao"));
// 카카오에서 설정한 redicrect url을 통해 요청 재전달
router.get("/kakao/callback", kakaoCallback);

module.exports = router;
