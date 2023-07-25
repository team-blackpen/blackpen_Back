const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);
const ErrorCustom = require("../middlewares/errorCustom");

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
        console.log("Query Error!", err);
        throw new ErrorCustom(500, "Query Error!");
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!", err);
      throw new ErrorCustom(500, "DB ERROR!");
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
        console.log("Query Error!", err);
        throw new ErrorCustom(500, "Query Error!");
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!", err);
      throw new ErrorCustom(500, "DB ERROR!");
    }
  };
}

module.exports = MyRepository;
