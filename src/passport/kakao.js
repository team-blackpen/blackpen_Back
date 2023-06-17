const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);

// const User = require('../models/user');

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID, // 카카오 로그인에서 발급받은 REST API 키
        callbackURL: process.env.KAKAO_CB_URL, // 카카오 로그인 Redirect URI 경로
      },
      /*
       * clientID에 카카오 앱 아이디 추가
       * callbackURL: 카카오 로그인 후 카카오가 결과를 전송해줄 URL
       * accessToken, refreshToken: 로그인 성공 후 카카오가 보내준 토큰
       * profile: 카카오가 보내준 유저 정보. profile의 정보를 바탕으로 회원가입
       */

      async (accessToken, refreshToken, profile, done) => {
        try {
          const connection = await pool.getConnection(async (corn) => corn);
          try {
            const query = `SELECT * FROM tb_user_social WHERE social_id = ? AND login_type = ?`;

            let [results] = await connection.query(query, [profile.id, "kakao"]);

            if (results) {
              done(null, results); // 로그인 인증 완료
            } else {
              const query2 = `INSERT INTO tb_user_social (user_no, login_type, social_id, access_token) VALUES (?, "kakao", ?, ?);`; // user_no은 자동 증가 해도되나?

              let [results2] = await connection.query(query2, [profile.id, accessToken]);

              const query3 = `INSERT INTO tb_user (user_no, user_name, login_type) VALUES (?, ?, "kakao");`; // user_no은 자동 증가 해도되나?

              let [results3] = await connection.query(query3, [results2.user_no, profile_nickname]); // user_no도 result2에 남을려나? 안남으면 서브쿼리 넣어서 셀렉트문 넣어주면 될려나?

              const user = {
                userNo: results2.user_no,
                nickname: profile_nickname,
              };
              done(null, user);
            }

            connection.release();

            return;
          } catch (err) {
            console.log("Query Error!", err);
            throw new ErrorCustom(500, "Query Error!");
            done(err);
          }
        } catch (err) {
          console.log("DB ERROR!", err);
          throw new ErrorCustom(500, "DB ERROR!");
          done(err);
        }
      }
    )
  );
};
