const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);

class MyRepository {
  // 서랍 내 편지함 갯수 조회
  // 서랍 내 임시저장 갯수 조회
  getLetterCnt = async (userNo, status) => {
    try {
      let where = `L.recipient_user_no = ?;`;
      if (status == 0) where = `L.user_no = ?;`;

      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT COUNT(L.letter_no) AS letterCnt 
          FROM tb_letter L 
          WHERE L.status = ? AND ${where}`;

        let [letterCnt] = await connection.query(query, [status, userNo]);

        return letterCnt[0].letterCnt;
      } catch (err) {
        console.log("Query Error!", err.sqlMessage);
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      throw err;
    }
  };

  // 서랍 내 찜목록 갯수 조회
  getPostWishCnt = async (userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT COUNT(Pw.post_wish_no) AS postWishCnt 
          FROM tb_post_wish Pw 
          WHERE Pw.status = 1 AND Pw.user_no = ?`;

        let [postWishCnt] = await connection.query(query, userNo);

        return postWishCnt[0].postWishCnt;
      } catch (err) {
        console.log("Query Error!", err.sqlMessage);
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      throw err;
    }
  };

  // 내 마음온도
  getHeartTemper = async (userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT user_no, nickname, heart_temper 
          FROM tb_user_profile  
          WHERE user_no = ?;`;

        let [heartTemper] = await connection.query(query, userNo);

        return heartTemper[0];
      } catch (err) {
        console.log("Query Error!", err.sqlMessage);
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      throw err;
    }
  };

  // 닉네임 변경
  changeNickname = async (userNo, nickname, uptDt) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `UPDATE tb_user_profile 
          SET nickname = ?, upt_dt = ? 
          WHERE user_no = ?;`;

        await connection.query(query, [nickname, uptDt, userNo]);

        return;
      } catch (err) {
        console.log("Query Error!", err.sqlMessage);
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      throw err;
    }
  };
}

module.exports = MyRepository;
