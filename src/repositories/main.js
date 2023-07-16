const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);
const ErrorCustom = require("../middlewares/errorCustom");

class MainRepository {
  getLetterListCnt = async (userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT COUNT(L.letter_no) AS letterListCnt FROM tb_letter L 
          LEFT JOIN tb_letter_read_log Lrl ON L.letter_no = Lrl.letter_no 
          WHERE L.status = 2 AND L.recipient_user_no = ? AND (Lrl.recipient_user_no IS NULL OR Lrl.recipient_user_no != 0);`;

        let [letterListCnt] = await connection.query(query, userNo);

        return letterListCnt[0].letterListCnt;
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

module.exports = MainRepository;
