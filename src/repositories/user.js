const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);

class PostListRepository {
  isUser = async (userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT user_no, nickname 
        FROM tb_user 
        WHERE user_no = ?;`;

        let [results] = await connection.query(query, [userNo]);

        connection.release();

        return results[0];
      } catch (err) {
        console.log("Query Error!");
        return err;
      }
    } catch (err) {
      console.log("DB ERROR!");
      return err;
    }
  };
}

module.exports = PostListRepository;
