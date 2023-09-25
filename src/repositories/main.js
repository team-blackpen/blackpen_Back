const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);

class MainRepository {
  // 메인 편지함 안읽은 편지 갯수 조회
  getLetterListCnt = async (userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT COUNT(L.letter_no) AS letterListCnt 
          FROM tb_letter L 
          LEFT JOIN tb_letter_read_log Lrl ON L.letter_no = Lrl.letter_no AND Lrl.recipient_user_no = ?
          WHERE L.status = 1 AND L.recipient_user_no = ? AND Lrl.letter_read_log_no IS NULL;`;

        let [letterListCnt] = await connection.query(query, [userNo, userNo]);

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

  // 메인 임시저장 목록 3개만 조회
  getLetterTmpList = async (userNo, yesterday) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT L.letter_no, L.user_no, L.post_no, IF(L.upt_dt, L.upt_dt, L.reg_dt) AS upt_dt, Lc.letter_contents_no, Lc.letter_contents 
          FROM tb_letter L 
          JOIN tb_letter_contents Lc ON L.letter_no = Lc.letter_no AND Lc.status = 1 
          WHERE L.status = 0 AND L.user_no = ? AND COALESCE(L.upt_dt, L.reg_dt) > ? 
          ORDER BY upt_dt DESC
          LIMIT 3;`;

        let [letterTmpList] = await connection.query(query, [userNo, yesterday]);

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

  // 메인 글귀 리스트 조회(랜덤)
  getQuote = async () => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT quote_no, quote, author, category 
          FROM tb_quote 
          WHERE status = 1;`;

        let [quoteList] = await connection.query(query);

        return quoteList;
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

  // 메인 기념일 조회
  getAnniversary = async (today) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT anniversary_no, date, anniversary_title, anniversary_des 
          FROM tb_anniversary 
          WHERE DATE >= ? 
          ORDER BY DATE 
          LIMIT 1;`;

        let [anniversary] = await connection.query(query, [today]);

        return anniversary;
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

  // 메인 선물하기 로그 수집
  postGift = async (userNo, giftPrice, today) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `INSERT INTO tb_gift_log 
          (user_no, gift_price, reg_dt) 
          VALUES (?, ?, ?);`;

        await connection.query(query, [userNo, giftPrice, today]);

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

module.exports = MainRepository;
