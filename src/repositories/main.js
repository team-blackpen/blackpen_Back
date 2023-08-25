const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);

class MainRepository {
  getLetterListCnt = async (userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT COUNT(L.letter_no) AS letterListCnt FROM tb_letter L 
          LEFT JOIN tb_letter_read_log Lrl ON L.letter_no = Lrl.letter_no 
          WHERE L.status = 1 AND L.recipient_user_no = ? AND (Lrl.recipient_user_no IS NULL OR Lrl.recipient_user_no != 0);`;

        let [letterListCnt] = await connection.query(query, userNo);

        return letterListCnt[0].letterListCnt;
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

  getLetterTmpList = async (userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT L.letter_no, L.user_no, L.post_no, IF(L.upt_dt, L.upt_dt, L.reg_dt) AS upt_dt, Lc.letter_contents_no, Lc.letter_contents 
          FROM tb_letter L 
          JOIN tb_letter_contents Lc ON L.letter_no = Lc.letter_no AND Lc.status = 0 
          WHERE L.status = 0 AND L.user_no = ?
          ORDER BY upt_dt DESC
          LIMIT 3;`;

        let [letterTmpList] = await connection.query(query, userNo);

        return letterTmpList;
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

module.exports = MainRepository;
