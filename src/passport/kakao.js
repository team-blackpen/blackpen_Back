const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);
const dayjs = require("dayjs");

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
          console.log("profile", profile);
          console.log(typeof profile.id);
          console.log(profile.id);
          const regDt = dayjs().format("YYYY-MM-DD hh:mm:ss");
          const connection = await pool.getConnection(async (corn) => corn);
          try {
            const query = `SELECT * FROM tb_user WHERE social_id = ? AND login_type = ?`;

            let [results] = await connection.query(query, [profile.id, "kakao"]);

            console.log("results", results);

            if (results.length > 0) {
              done(null, results[0]); // 로그인 인증 완료
            } else {
              console.log(2222222);
              const query2 = `INSERT INTO tb_user (nickname, social_id, access_token, login_type, reg_dt) 
			    VALUES (?, ?, ?, "kakao", ?);`;

              let [results2] = await connection.query(query2, [profile.displayName, profile.id, accessToken, regDt]);
              console.log("results2", results2);
              // const query3 = `INSERT INTO tb_user (user_no, user_name, login_type) VALUES (?, ?, "kakao");`; // user_no은 자동 증가 해도되나?

              // let [results3] = await connection.query(query3, [results2.user_no, profile_nickname]); // user_no도 result2에 남을려나? 안남으면 서브쿼리 넣어서 셀렉트문 넣어주면 될려나?

              const user = {
                user_no: results2.insertId,
                nickname: profile.displayName,
              };

              console.log("user2", user);
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
