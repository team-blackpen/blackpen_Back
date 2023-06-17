require("dotenv").config();
const express = require("express");
const router = express.Router();
// const passport = require("../passport/kakao");
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

        const { userNo, nickname } = user;

        const accessToken = jwt.sign({ userNo: user.userNo }, process.env.JWT_KEY, { expiresIn: "3h" });
        // const refreshToken = jwt.sign(
        //   { userNo: user.userNo },
        //   process.env.JWT_KEY,
        //   { expiresIn: '5h' }
        // );

        result = { userNo, accessToken, nickname };
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
