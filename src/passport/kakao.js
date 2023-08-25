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
          const profileProperties = profile._json.properties;
          const profileInfo = profile._json.kakao_account;
          let nickname = profileProperties.nickname;
          let userImg = profileProperties.thumbnail_image ? profileProperties.thumbnail_image : "";
          console.log("🚀 ~ file: kakao.js:36 ~ userImg:", userImg);
          let email = profileInfo.email;
          let name = profileInfo.name ? profileInfo.name : "";
          let gender = profileInfo.gender ? profileInfo.gender : "";
          let phone = profileInfo.phone_number;
          let ageRange = profileInfo.age_range ? profileInfo.age_range : "";
          let birthYear = profileInfo.birthyear ? profileInfo.birthyear : "";
          let birthday = profileInfo.birthday ? profileInfo.birthday : "";

          const connection = await pool.getConnection(async (corn) => corn);
          try {
            await connection.beginTransaction(); // 트랜잭션 적용 시작
            const query = `SELECT U.user_no, Up.nickname, Up.user_img_url 
              FROM tb_user U 
              JOIN tb_user_profile Up ON Up.user_no = U.user_no 
              WHERE social_id = ? AND login_type = ?`;

            let [user] = await connection.query(query, [profile.id, profile.provider]);
            console.log("🚀 ~ file: kakao.js:53 ~ user:", user);
            console.log("🚀 ~ file: kakao.js:54 ~ user[0]:", user[0]);

            if (user.length > 0) {
              // 프로필 변경
              console.log(111);
              if (userImg != user[0].user_img_url) {
                const uptProfile = `UPDATE tb_user_profile 
                  SET user_img_url = ? AND upt_dt = ? 
                  WHERE user_no = ?;`;

                console.log(222);
                await connection.query(uptProfile, [userImg, regDt, user[0].user_no]);
                console.log(333);
                user[0].user_img_url = userImg;
                console.log(444);
              }
              console.log("🚀 ~ file: kakao.js:65 ~ user[0]:", user[0]);

              done(null, user[0]); // 로그인 인증 완료
            } else {
              const insUser = `INSERT INTO tb_user 
                (social_id, access_token, login_type, reg_dt) 
			          VALUES (?, ?, ?, ?);`;

              let [insNewUser] = await connection.query(insUser, [profile.id, accessToken, profile.provider, regDt]);

              const insUserProfile = `INSERT INTO tb_user_profile
                (user_no, nickname, user_img_url, heart_temper, email, name, gender, user_phone, age_range, birth_year, birthday)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

              let [insNewUserProfile] = await connection.query(insUserProfile, [insNewUser.insertId, nickname, userImg, 10, email, name, gender, phone, ageRange, birthYear, birthday]);

              const newUser = {
                user_no: insNewUser.insertId,
                nickname: nickname,
                user_img_url: userImg,
              };

              done(null, newUser);
            }

            await connection.commit(); // 커밋

            return;
          } catch (err) {
            console.log("Query Error!", err.sqlMessage);
            await connection.rollback(); // 롤백
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
