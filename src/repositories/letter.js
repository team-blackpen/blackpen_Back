const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);

class LetterRepository {
  getTmpLetter = async (userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT letter_no FROM tb_letter WHERE user_no = ? AND status = 0`;

        let [letterNo] = await connection.query(query, [userNo]);

        return letterNo[0];
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

  insTmpLetter = async (userNo, postNo, contents, font, regDt) => {
    try {
      const fontNo = font.font_no;
      const fontSize = font.font_size;
      const pageCnt = contents.length;
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        const insLetter = `INSERT INTO tb_letter (user_no, post_no, status, reg_dt) VALUES (?, ?, 0, ?);`;
        const [letter] = await connection.query(insLetter, [userNo, postNo, regDt]);
        const letterNo = letter.insertId;

        const insLetterInfo = `INSERT INTO tb_letter_info (letter_no, user_no, post_no, font_no, font_size, page_cnt, reg_dt) 
        VALUES (?, ?, ?, ?, ?, ?, ?);`;
        await connection.query(insLetterInfo, [letterNo, userNo, postNo, fontNo, fontSize, pageCnt, regDt]);

        for (let i = 1; i <= pageCnt; i++) {
          const insLetterContent = `INSERT INTO tb_letter_contents (letter_no, user_no, post_no, letter_contents, page_no, reg_dt) 
            VALUES (?, ?, ?, ?, ?, ?);`;
          await connection.query(insLetterContent, [letterNo, userNo, postNo, contents[i].letter_contents, i, regDt]);
        }

        await connection.commit(); // 커밋

        return;
      } catch (err) {
        console.log("Query Error!");
        await connection.rollback(); // 롤백
        return err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      return err;
    }
  };

  updTmpLetter = async (tmpLetter_no, contents, font, regDt) => {
    try {
      const fontNo = font.font_no;
      const fontSize = font.font_size;
      const pageCnt = contents.length;
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        const updLetterInfo = `UPDATE tb_letter_info 
        SET font_no = ?, font_size = ?, page_cnt = ?, upt_dt = ? 
        WHERE letter_no = ?;`;
        await connection.query(updLetterInfo, [fontNo, fontSize, pageCnt, regDt, tmpLetter_no]);

        for (let i = 1; i <= pageCnt; i++) {
          const insLetterContent = `UPDATE tb_letter_contents 
          SET letter_contents = ?, page_no = ?, upt_dt = ? 
          WHERE letter_no = ?;`;
          await connection.query(insLetterContent, [contents[i].letter_contents, i, regDt, tmpLetter_no]);
        }

        await connection.commit(); // 커밋

        return;
      } catch (err) {
        console.log("Query Error!");
        await connection.rollback(); // 롤백
        return err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      return err;
    }
  };

  insLetter = async (userNo, postNo, contents, font, info, img, regDt) => {
    try {
      const fontNo = font.font_no;
      const fontSize = font.font_size;
      const pageCnt = contents.length;
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        const insLetter = `INSERT INTO tb_letter (user_no, post_no, status, reg_dt) VALUES (?, ?, 1, ?);`;
        const [letter] = await connection.query(insLetter, [userNo, postNo, regDt]);
        const letterNo = letter.insertId;

        const insLetterInfo = `INSERT INTO tb_letter_info 
        (letter_no, user_no, post_no, font_no, font_size, page_cnt, recipient, recipient_phone, sender, sender_phone, reservation_status, reservation_dt, reg_dt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        await connection.query(insLetterInfo, [
          letterNo,
          userNo,
          postNo,
          fontNo,
          fontSize,
          pageCnt,
          info.recipient,
          info.recipient_phone,
          info.sender,
          info.sender_phone,
          info.reservation_status,
          info.reservation_dt,
          regDt,
        ]);

        for (let i = 1; i <= pageCnt; i++) {
          const insLetterContent = `INSERT INTO tb_letter_contents (letter_no, user_no, post_no, letter_contents, page_no, reg_dt) 
            VALUES (?, ?, ?, ?, ?, ?);`;
          await connection.query(insLetterContent, [letterNo, userNo, postNo, contents[i].letter_contents, i, regDt]);
        }

        for (let i = 1; i <= img.length; i++) {
          const insLetterContent = `INSERT INTO tb_letter_img (letter_no, user_no, post_no, letter_img_url, view_seq, reg_dt) 
              VALUES (?, ?, ?, ?, ?, ?);`;
          await connection.query(insLetterContent, [letterNo, userNo, postNo, img[i], i, regDt]);
        }

        await connection.commit(); // 커밋

        return;
      } catch (err) {
        console.log("Query Error!");
        await connection.rollback(); // 롤백
        return err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      return err;
    }
  };
}

updLetter = async (tmpLetter_no, contents, font, info, img, regDt) => {
  try {
    const fontNo = font.font_no;
    const fontSize = font.font_size;
    const pageCnt = contents.length;
    const connection = await pool.getConnection(async (corn) => corn);
    try {
      await connection.beginTransaction(); // 트랜잭션 적용 시작

      const updLetter = `UPDATE tb_letter SET status = 1 WHERE letter_no = ?;`;
      await connection.query(updLetter, [tmpLetter_no]);

      const updLetterInfo = `UPDATE tb_letter_info 
        SET font_no = ?, font_size = ?, page_cnt = ?, recipient = ?, recipient_phone = ?, sender = ?, sender_phone = ?, reservation_status = ?, reservation_dt = ?, upt_dt = ? 
        WHERE letter_no = ?;`;
      await connection.query(updLetterInfo, [
        fontNo,
        fontSize,
        pageCnt,
        info.recipient,
        info.recipient_phone,
        info.sender,
        info.sender_phone,
        info.reservation_status,
        info.reservation_dt,
        regDt,
        tmpLetter_no,
      ]);

      for (let i = 1; i <= pageCnt; i++) {
        const insLetterContent = `UPDATE tb_letter_contents 
          SET letter_contents = ?, page_no = ?, upt_dt = ? 
          WHERE letter_no = ?;`;
        await connection.query(insLetterContent, [contents[i].letter_contents, i, regDt, tmpLetter_no]);
      }

      for (let i = 1; i <= img.length; i++) {
        const insLetterContent = `INSERT INTO tb_letter_img (letter_no, user_no, post_no, letter_img_url, view_seq, reg_dt) 
            VALUES (?, ?, ?, ?, ?, ?);`;
        await connection.query(insLetterContent, [letterNo, userNo, postNo, img[i], i, regDt]);
      }

      await connection.commit(); // 커밋

      return;
    } catch (err) {
      console.log("Query Error!");
      await connection.rollback(); // 롤백
      return err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.log("DB ERROR!");
    return err;
  }
};

module.exports = LetterRepository;
