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
          console.log("🚀 ~ file: kakao.js:33 ~ profileProperties:", profileProperties);
          const profileInfo = profile._json.kakao_account;
          console.log("🚀 ~ file: kakao.js:34 ~ profileInfo:", profileInfo);
          let nickname = profileProperties.nickname;
          console.log("🚀 ~ file: kakao.js:37 ~ nickname:", nickname);
          let userImg = profileProperties.thumbnail_image ? profileProperties.thumbnail_image : "";
          console.log("🚀 ~ file: kakao.js:39 ~ userImg:", userImg);
          let email = profileInfo.email;
          console.log("🚀 ~ file: kakao.js:41 ~ email:", email);
          let name = profileInfo.name;
          console.log("🚀 ~ file: kakao.js:43 ~ name:", name);
          let gender = "";
          if (profileInfo.gender == "male") {
            gender = 1;
          } else if (profileInfo.gender == "female") {
            gender = 2;
          }
          console.log("🚀 ~ file: kakao.js:49 ~ gender:", gender);
          let phone = profileInfo.phone_number;
          console.log("🚀 ~ file: kakao.js:52 ~ phone:", phone);
          let ageRange = profileInfo.age_range ? profileInfo.age_range : "";
          console.log("🚀 ~ file: kakao.js:54 ~ ageRange:", ageRange);
          let birthYear = profileInfo.birthyear ? profileInfo.birthyear : "";
          console.log("🚀 ~ file: kakao.js:56 ~ birthYear:", birthYear);
          let birthday = profileInfo.birthday ? profileInfo.birthday : "";
          console.log("🚀 ~ file: kakao.js:57 ~ birthday:", birthday);

          const connection = await pool.getConnection(async (corn) => corn);
          try {
            const query = `SELECT U.user_no, Up.nickname, Up.user_img_url 
              FROM tb_user U 
              JOIN tb_user_profile Up ON Up.uer_no = U.user_no 
              WHERE social_id = ? AND login_type = ?`;

            let [user] = await connection.query(query, [profile.id, profile.provider]);

            if (user.length > 0) {
              done(null, user[0]); // 로그인 인증 완료
            } else {
              // 닉네임, 온도 지워야함
              const insUser = `INSERT INTO tb_user 
                (nickname, social_id, access_token, login_type, heart_temper, reg_dt) 
			          VALUES (?, ?, ?, ?, ?, ?);`;

              let [insNewUser] = await connection.query(insUser, [profile.displayName, profile.id, accessToken, profile.provider, 10, regDt]);

              // const insUserProfile = `INSERT INTO tb_user_profile
              //   (user_no, nickname, user_img_url, heart_temper, email, name, gender, user_phone, age_range, birthday, birth_year)
              //   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

              // let [insNewUserProfile] = await connection.query(insUserProfile, [insNewUser.insertId, profile.displayName, profile., 10, profile., profile.username, profile., profile., profile., profile., profile.]);

              const newUser = {
                user_no: insNewUser.insertId,
                nickname: profile.displayName,
                // user_img_url: profile.
              };

              done(null, newUser);
            }

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
