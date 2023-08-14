const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);

class AligoRepository {
  // 알림톡 템플릿 가져오기
  getTemplate = async (title) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT template_no, template_code, template_title, template_msg, button_name, button_link, button_link_name, button_mo, button_pc
        FROM tb_template WHERE template_title = ?`;

        let [template] = await connection.query(query, title);

        return template[0];
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

module.exports = AligoRepository;
