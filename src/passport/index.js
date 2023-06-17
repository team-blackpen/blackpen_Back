const passport = require("passport");
// const local = require('./localStrategy'); // 로컬서버로 로그인할때
const kakao = require("./kakao"); // 카카오서버로 로그인할때

// const User = require("../models/user");

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  //    local();
  kakao(); // 구글 전략 등록
};
