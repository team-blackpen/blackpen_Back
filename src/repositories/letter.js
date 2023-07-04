const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);
const ErrorCustom = require("../middlewares/errorCustom");

class LetterRepository {
  getTmpLetter = async (userNo, postNo, letterNo) => {
    try {
      let addWhere = "";
      let params = [];
      if (letterNo != "") {
        addWhere = `letter_no = ?`;
        params.push(letterNo);
      } else {
        addWhere = `user_no = ? AND post_no = ?`;
        params.push(userNo, postNo);
      }
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT letter_no FROM tb_letter WHERE ${addWhere} AND status = 0`;

        let [letterNo] = await connection.query(query, params);

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

  insTmpLetter = async (userNo, postNo, stage, contents, font, regDt) => {
    try {
      const fontNo = font.font_no;
      const fontSize = font.font_size;
      const pageCnt = contents.length;
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        const insLetter = `INSERT INTO tb_letter (user_no, post_no, status, stage, reg_dt) VALUES (?, ?, 0, ?, ?);`;
        const [letter] = await connection.query(insLetter, [userNo, postNo, stage, regDt]);
        const letterNo = letter.insertId;

        // const insLetterInfo = `INSERT INTO tb_letter_info (letter_no, user_no, post_no, font_no, font_size, page_cnt)
        // VALUES (?, ?, ?, ?, ?, ?);`;
        // await connection.query(insLetterInfo, [letterNo, userNo, postNo, fontNo, fontSize, pageCnt]);

        // for (let i = 0; i < pageCnt; i++) {
        //   console.log("🚀 ~ file: letter.js:58 ~ LetterRepository ~ insTmpLetter= ~ contents[i]:", contents[i]);
        //   const insLetterContent = `INSERT INTO tb_letter_contents (letter_no, user_no, post_no, letter_contents, page_no, status, reg_dt)
        //     VALUES (?, ?, ?, ?, ?, 0, ?);`;
        //   await connection.query(insLetterContent, [letterNo, userNo, postNo, contents[i].letter_contents, i + 1, regDt]);
        // }

        await connection.commit(); // 커밋

        return letterNo;
      } catch (err) {
        console.log("Query Error!", err);
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

  uptTmpLetter = async (letterNo, userNo, postNo, stage, contents, font, uptDt) => {
    try {
      const fontNo = font.font_no;
      const fontSize = font.font_size;
      const pageCnt = contents.length;
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        const uptLetter = `UPDATE tb_letter 
        SET stage = ?, upt_dt = ? 
        WHERE letter_no = ?;`;
        await connection.query(uptLetter, [stage, uptDt, letterNo]);

        const uptLetterInfo = `UPDATE tb_letter_info 
        SET font_no = ?, font_size = ?, page_cnt = ?
        WHERE letter_no = ?;`;
        await connection.query(uptLetterInfo, [fontNo, fontSize, pageCnt, letterNo]);

        // for (let i = 1; i <= pageCnt; i++) {
        //   const insLetterContent = `UPDATE tb_letter_contents
        //   SET letter_contents = ?, page_no = ?
        //   WHERE letter_no = ?;`;
        //   await connection.query(insLetterContent, [contents[i].letter_contents, i, letterNo]);
        // }

        const uptLetterContent = `UPDATE tb_letter_contents 
          SET status = 1
          WHERE letter_no = ?;`;
        await connection.query(uptLetterContent, [letterNo]);

        for (let i = 0; i < pageCnt; i++) {
          const insLetterContent = `INSERT INTO tb_letter_contents (letter_no, user_no, post_no, letter_contents, page_no, status, reg_dt) 
              VALUES (?, ?, ?, ?, ?, 0, ?);`;
          await connection.query(insLetterContent, [letterNo, userNo, postNo, contents[i].letter_contents, i + 1, uptDt]);
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

  insLetter = async (userNo, postNo, stage, contents, font, info, img, regDt) => {
    try {
      const fontNo = font.font_no;
      const fontSize = font.font_size;
      const pageCnt = contents.length;
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        const insLetter = `INSERT INTO tb_letter (user_no, post_no, status, stage, reg_dt) VALUES (?, ?, 1, ?, ?);`;
        const [letter] = await connection.query(insLetter, [userNo, postNo, stage, regDt]);
        const letterNo = letter.insertId;

        const insLetterInfo = `INSERT INTO tb_letter_info 
        (letter_no, user_no, post_no, font_no, font_size, page_cnt, recipient, recipient_phone, sender, sender_phone, reservation_status, reservation_dt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
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
        ]);

        for (let i = 0; i < pageCnt; i++) {
          const insLetterContent = `INSERT INTO tb_letter_contents (letter_no, user_no, post_no, letter_contents, page_no, status, reg_dt) 
            VALUES (?, ?, ?, ?, ?, 0, ?);`;
          await connection.query(insLetterContent, [letterNo, userNo, postNo, contents[i].letter_contents, i + 1, regDt]);
        }

        for (let i = 0; i < img.length; i++) {
          const insLetterContent = `INSERT INTO tb_letter_img (letter_no, user_no, post_no, letter_img_url, view_seq, reg_dt) 
              VALUES (?, ?, ?, ?, ?, ?);`;
          await connection.query(insLetterContent, [letterNo, userNo, postNo, img[i], i, regDt]);
        }

        await connection.commit(); // 커밋

        return letterNo;
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

  uptLetter = async (letterNo, userNo, postNo, stage, contents, font, info, img, uptDt) => {
    try {
      const fontNo = font.font_no;
      const fontSize = font.font_size;
      const pageCnt = contents.length;
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        const uptLetter = `UPDATE tb_letter SET status = 1, stage = ?, upt_dt = ? WHERE letter_no = ?;`;
        await connection.query(uptLetter, [stage, uptDt, letterNo]);

        const uptLetterInfo = `UPDATE tb_letter_info 
          SET font_no = ?, font_size = ?, page_cnt = ?, recipient = ?, recipient_phone = ?, sender = ?, sender_phone = ?, reservation_status = ?, reservation_dt = ? 
          WHERE letter_no = ?;`;
        await connection.query(uptLetterInfo, [
          fontNo,
          fontSize,
          pageCnt,
          info.recipient,
          info.recipient_phone,
          info.sender,
          info.sender_phone,
          info.reservation_status,
          info.reservation_dt,
          letterNo,
        ]);

        // for (let i = 1; i <= pageCnt; i++) {
        //   const insLetterContent = `UPDATE tb_letter_contents
        //     SET letter_contents = ?, page_no = ?, upt_dt = ?
        //     WHERE letter_no = ?;`;
        //   await connection.query(insLetterContent, [contents[i].letter_contents, i, regDt, tmpLetter_no]);
        // }

        const uptLetterContent = `UPDATE tb_letter_contents 
          SET status = 1
          WHERE letter_no = ?;`;
        await connection.query(uptLetterContent, [letterNo]);

        for (let i = 0; i < pageCnt; i++) {
          const insLetterContent = `INSERT INTO tb_letter_contents (letter_no, user_no, post_no, letter_contents, page_no, status, reg_dt) 
              VALUES (?, ?, ?, ?, ?, 0, ?);`;
          await connection.query(insLetterContent, [letterNo, userNo, postNo, contents[i].letter_contents, i + 1, uptDt]);
        }

        for (let i = 0; i < img.length; i++) {
          const insLetterContent = `INSERT INTO tb_letter_img (letter_no, user_no, post_no, letter_img_url, view_seq, reg_dt) 
              VALUES (?, ?, ?, ?, ?, ?);`;
          await connection.query(insLetterContent, [letterNo, userNo, postNo, img[i], i, uptDt]);
        }

        await connection.commit(); // 커밋

        return;
      } catch (err) {
        console.log("Query Error!", err);
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

module.exports = LetterRepository;
