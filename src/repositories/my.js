const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);

class MyRepository {
  getLetterCnt = async (userNo, status) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT COUNT(L.letter_no) AS letterCnt FROM tb_letter L 
          WHERE L.status = ? AND L.recipient_user_no = ?;`;

        let [letterCnt] = await connection.query(query, [status, userNo]);

        return letterCnt[0].letterCnt;
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
  };

  getPostWishCnt = async (userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT COUNT(Pw.post_wish_no) AS postWishCnt FROM tb_post_wish Pw 
          WHERE Pw.status = 1 AND Pw.user_no = ?`;

        let [postWishCnt] = await connection.query(query, userNo);

        return postWishCnt[0].postWishCnt;
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
  };

  getHeartTemper = async (userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT user_no, nickname, heart_temper FROM tb_user 
        WHERE user_no = ?;`;

        let [heartTemper] = await connection.query(query, userNo);

        return heartTemper[0];
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
  };
}

module.exports = MyRepository;
