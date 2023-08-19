require("dotenv").config();
const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

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
          const regDt = dayjs().format("YYYY-MM-DD HH:mm:ss");
          const connection = await pool.getConnection(async (corn) => corn);
          try {
            const query = `SELECT user_no, nickname FROM tb_user 
              WHERE social_id = ? AND login_type = ?`;

            let [results] = await connection.query(query, [profile.id, "kakao"]);

            if (results.length > 0) {
              done(null, results[0]); // 로그인 인증 완료
            } else {
              const insUser = `INSERT INTO tb_user 
                (nickname, social_id, access_token, login_type, heart_temper, reg_dt) 
			          VALUES (?, ?, ?, "kakao", 10, ?);`;

              let [results2] = await connection.query(insUser, [profile.displayName, profile.id, accessToken, regDt]);

              const user = {
                user_no: results2.insertId,
                nickname: profile.displayName,
              };

              done(null, user);
            }

            connection.release();

            return;
          } catch (err) {
            console.log("Query Error!");
            throw err;
          } finally {
            connection.release();
          }
        } catch (err) {
          console.log("DB ERROR!");
          throw err;
        }
      }
    )
  );
};
