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
  // 임시저장 편지 확인하는 쿼리 사용안하는중

  insTmpLetter = async (userNo, postNo, stage, contents, fontNo, info, regDt) => {
    try {
      //   const fontNo = font.font_no;
      const fontSize = 10;
      const pageCnt = 1;
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        const insLetter = `INSERT INTO tb_letter (user_no, post_no, status, stage, reg_dt) VALUES (?, ?, 0, ?, ?);`;
        const [letter] = await connection.query(insLetter, [userNo, postNo, stage, regDt]);
        const letterNo = letter.insertId;

        const insLetterInfo = `INSERT INTO tb_letter_info (letter_no, user_no, post_no, font_no, font_size, page_cnt, recipient, recipient_phone, sender, sender_phone, reservation_status, reservation_dt)
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

        const insLetterContent = `INSERT INTO tb_letter_contents (letter_no, user_no, post_no, letter_contents, page_no, status, reg_dt)
            VALUES (?, ?, ?, ?, ?, 0, ?);`;
        await connection.query(insLetterContent, [letterNo, userNo, postNo, contents, 1, regDt]);

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

  uptTmpLetter = async (letterNo, userNo, postNo, stage, contents, fontNo, info, uptDt) => {
    try {
      //   const fontNo = font.font_no;
      const fontSize = 10;
      const pageCnt = 1;
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        const uptLetter = `UPDATE tb_letter 
        SET stage = ?, upt_dt = ? 
        WHERE letter_no = ?;`;
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

        const uptLetterContent = `UPDATE tb_letter_contents 
          SET status = 1
          WHERE letter_no = ?;`;
        await connection.query(uptLetterContent, [letterNo]);

        const insLetterContent = `INSERT INTO tb_letter_contents (letter_no, user_no, post_no, letter_contents, page_no, status, reg_dt) 
              VALUES (?, ?, ?, ?, ?, 0, ?);`;
        await connection.query(insLetterContent, [letterNo, userNo, postNo, contents, 1, uptDt]);

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

  insLetter = async (userNo, postNo, stage, contents, fontNo, info, img, regDt) => {
    try {
      //   const fontNo = font.font_no;
      const fontSize = 10;
      const pageCnt = 1;
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

        const insLetterContent = `INSERT INTO tb_letter_contents (letter_no, user_no, post_no, letter_contents, page_no, status, reg_dt) 
            VALUES (?, ?, ?, ?, ?, 0, ?);`;
        await connection.query(insLetterContent, [letterNo, userNo, postNo, contents, 1, regDt]);

        for (let i = 0; i < img.length; i++) {
          const insLetterContent = `INSERT INTO tb_letter_img (letter_no, user_no, post_no, letter_img_url, view_seq, reg_dt) 
              VALUES (?, ?, ?, ?, ?, ?);`;
          await connection.query(insLetterContent, [letterNo, userNo, postNo, img[i], i, regDt]);
        }

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

  uptLetter = async (letterNo, userNo, postNo, stage, contents, fontNo, info, img, uptDt) => {
    try {
      //   const fontNo = font.font_no;
      const fontSize = 10;
      const pageCnt = 1;
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

        const uptLetterContent = `UPDATE tb_letter_contents 
          SET status = 1
          WHERE letter_no = ?;`;
        await connection.query(uptLetterContent, [letterNo]);

        const insLetterContent = `INSERT INTO tb_letter_contents (letter_no, user_no, post_no, letter_contents, page_no, status, reg_dt) 
              VALUES (?, ?, ?, ?, ?, 0, ?);`;
        await connection.query(insLetterContent, [letterNo, userNo, postNo, contents, 1, uptDt]);

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

  getLetterList = async (reUserNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT L.letter_no, L.user_no, L.post_no, Li.sender, L.send_dt 
          FROM tb_letter L 
          JOIN tb_letter_info Li ON L.letter_no = Li.letter_no
          WHERE L.recipient_user_no = ? AND L.status = 2`;

        let [letterList] = await connection.query(query, reUserNo);

        if (letterList.length > 0) {
          for (let i in letterList) {
            const queryimg = `SELECT letter_img_no, letter_img_url FROM tb_letter_img WHERE letter_no = ?`;
            let [letterImg] = await connection.query(queryimg, letterList[i].letter_no);

            letterList[i].img = letterImg;
          }
        }

        return letterList;
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

module.exports = LetterRepository;
