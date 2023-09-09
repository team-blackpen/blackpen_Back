const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);
require("dotenv").config();
let hashKey = process.env.HASH_KEY;

class LetterRepository {
  // 편지 작성(임시저장, 작성완료)
  insLetter = async (userNo, postNo, status, stage, contents, fontNo, info, img, regDt) => {
    try {
      //   const fontNo = font.font_no;
      const fontSize = 10;
      const pageCnt = 1;
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        // 편지 새로 생성
        const insLetter = `INSERT INTO tb_letter 
          (user_no, post_no, status, stage, reg_dt) 
          VALUES (?, ?, ?, ?, ?);`;
        const [letter] = await connection.query(insLetter, [userNo, postNo, status, stage, regDt]);
        let letterNo = letter.insertId;

        // 작성완료일때만 편지 암호화
        if (status == 1) {
          const uptLetter = `UPDATE tb_letter 
            SET hash_no = HEX(AES_ENCRYPT(?, ?)) 
            WHERE letter_no = ?;`;
          await connection.query(uptLetter, [letterNo.toString(), hashKey, letterNo]);
        }

        // 편지 정보 생성
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
          info.recipientPhone,
          info.sender,
          info.senderPhone,
          info.reservationStatus,
          info.reservationDt,
        ]);

        // 편지 내용 생성
        const insLetterContent = `INSERT INTO tb_letter_contents 
          (letter_no, user_no, post_no, letter_contents, page_no, status, reg_dt) 
          VALUES (?, ?, ?, ?, ?, 1, ?);`;
        await connection.query(insLetterContent, [letterNo, userNo, postNo, contents, 1, regDt]);

        // 편지 이미지 생성(임시저장 할때 이미지 없을 수 있음)
        if (status == 1 && img.length > 0) {
          for (let i = 0; i < img.length; i++) {
            const insLetterContent = `INSERT INTO tb_letter_img 
              (letter_no, user_no, post_no, letter_img_url, status, view_seq, reg_dt) 
              VALUES (?, ?, ?, ?, 1, ?, ?);`;
            await connection.query(insLetterContent, [letterNo, userNo, postNo, img[i], i, regDt]);
          }
        }

        // 작성 편지 암호화 값 가져오기
        const getLetterQuery = `SELECT letter_no, hash_no 
          FROM tb_letter 
          WHERE letter_no = ?`;
        const [hashLetterNo] = await connection.query(getLetterQuery, [letterNo]);

        await connection.commit(); // 커밋

        return hashLetterNo[0];
      } catch (err) {
        console.log("Query Error!", err.sqlMessage);
        await connection.rollback(); // 롤백
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      throw err;
    }
  };

  uptLetter = async (letterNo, userNo, postNo, status, stage, contents, fontNo, info, img, uptDt) => {
    try {
      //   const fontNo = font.font_no;
      const fontSize = 10;
      const pageCnt = 1;
      let addWhere = ``;
      let addQurey = [status, stage, uptDt, letterNo];
      if (status == 1) {
        addWhere = `, hash_no = HEX(AES_ENCRYPT(?, ?)) `;
        addQurey = [status, stage, uptDt, letterNo.toString(), hashKey, letterNo];
      }
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        // 편지 상태 수정
        const uptLetter = `UPDATE tb_letter 
          SET status = ?, stage = ?, upt_dt = ? ${addWhere} 
          WHERE letter_no = ? AND status = 0;`;
        const letter = await connection.query(uptLetter, addQurey);

        if ((letter.affectedRows = 0)) return letter;

        // 편지 정보 수정
        const uptLetterInfo = `UPDATE tb_letter_info 
          SET font_no = ?, font_size = ?, page_cnt = ?, recipient = ?, recipient_phone = ?, sender = ?, sender_phone = ?, reservation_status = ?, reservation_dt = ? 
          WHERE letter_no = ?;`;
        await connection.query(uptLetterInfo, [fontNo, fontSize, pageCnt, info.recipient, info.recipientPhone, info.sender, info.senderPhone, info.reservationStatus, info.reservationDt, letterNo]);

        // 기존의 임시 편지 내용 삭제
        const uptLetterContent = `UPDATE tb_letter_contents 
          SET status = 0 
          WHERE letter_no = ?;`;
        await connection.query(uptLetterContent, [letterNo]);

        // 편지 내용 생성
        const insLetterContent = `INSERT INTO tb_letter_contents 
          (letter_no, user_no, post_no, letter_contents, page_no, status, reg_dt) 
          VALUES (?, ?, ?, ?, ?, 1, ?);`;
        await connection.query(insLetterContent, [letterNo, userNo, postNo, contents, 1, uptDt]);

        if (status == 1 && img.length > 0) {
          // 기존의 임시 편지 이미지 삭제
          const uptLetterImg = `UPDATE tb_letter_img 
            SET status = 0 
            WHERE letter_no = ?;`;
          await connection.query(uptLetterImg, [letterNo]);

          // 편지 이미지화 생성
          for (let i = 0; i < img.length; i++) {
            const insLetterImg = `INSERT INTO tb_letter_img 
              (letter_no, user_no, post_no, letter_img_url, status, view_seq, reg_dt) 
              VALUES (?, ?, ?, ?, 1, ?, ?);`;
            await connection.query(insLetterImg, [letterNo, userNo, postNo, img[i], i, uptDt]);
          }
        }

        // 작성 편지 암호화 값 가져오기
        const getLetterQuery = `SELECT letter_no, hash_no 
          FROM tb_letter 
          WHERE letter_no = ?`;
        const [hashLetterNo] = await connection.query(getLetterQuery, [letterNo]);

        await connection.commit(); // 커밋

        return hashLetterNo[0];
      } catch (err) {
        console.log("Query Error!", err.sqlMessage);
        await connection.rollback(); // 롤백
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      throw err;
    }
  };

  // 작성완료 편지 임시편지로 되돌리기
  rollBackLetter = async (letterNo, uptDt) => {
    try {
      console.log("🚀 ~ file: letter.js:171 ~ LetterRepository ~ rollBackLetter= ~ letterNo:", letterNo);
      console.log("롤백");
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        // 편지 임시편지로 다시 롤백
        const uptLetter = `UPDATE tb_letter 
          SET status = 0, upt_dt = ?, hash_no = "" 
          WHERE letter_no = ?;`;
        const letter = await connection.query(uptLetter, [uptDt, letterNo.letter_no]);

        const uptLetterImg = `UPDATE tb_letter_img 
          SET status = 0 
          WHERE letter_no = ?;`;
        await connection.query(uptLetterImg, [letterNo.letter_no]);

        await connection.commit(); // 커밋

        console.log("롤백");
        return letter;
      } catch (err) {
        console.log("Query Error!", err.sqlMessage);
        await connection.rollback(); // 롤백
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      throw err;
    }
  };

  // 마음온도 올리기
  plusHeart = async (userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `UPDATE tb_user_profile 
          SET heart_temper = heart_temper + 0.5 
          WHERE user_no = ?;`;

        let [plusHeart] = await connection.query(query, [userNo]);

        return plusHeart;
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

  // 발송한 편지 받는 번호의 유저가 있으면 바로 종속
  dependentLetter = async (recipientPhone, letterNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT user_no 
          FROM tb_user_profile 
          WHERE user_phone = ?;`;

        let [userNo] = await connection.query(query, [recipientPhone]);

        if (userNo.length > 0) {
          const dependentQuery = `UPDATE tb_letter 
            SET recipient_user_no = ? 
            WHERE letter_no = ?;`;

          await connection.query(dependentQuery, [userNo[0].user_no, letterNo]);
        }

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

  // 받은편지함 조회
  getLetterList = async (reUserNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT L.letter_no, L.user_no, L.post_no, Li.sender, L.send_dt 
          FROM tb_letter L 
          JOIN tb_letter_info Li ON L.letter_no = Li.letter_no 
          WHERE L.recipient_user_no = ? AND L.status = 1`;

        let [letterList] = await connection.query(query, reUserNo);

        if (letterList.length > 0) {
          for (let i in letterList) {
            const queryimg = `SELECT letter_img_no, letter_img_url 
              FROM tb_letter_img 
              WHERE letter_no = ? AND status = 1`;
            let [letterImg] = await connection.query(queryimg, letterList[i].letter_no);

            letterList[i].img = letterImg;
          }
        }

        return letterList;
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

  // 임시편지함 조회
  getLetterTmpList = async (userNo, yesterday) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT L.letter_no, L.user_no, L.post_no, IF(L.upt_dt, L.upt_dt, L.reg_dt) AS upt_dt, Lc.letter_contents_no, Lc.letter_contents, Pi.post_img_no, Pi.img_url 
          FROM tb_letter L 
          JOIN tb_letter_contents Lc ON L.letter_no = Lc.letter_no AND Lc.status = 1 
          JOIN tb_post_img Pi ON L.post_no = Pi.post_no AND Pi.view_seq = 0 AND Pi.status = 1 
          WHERE L.user_no = ? AND L.status = 0 AND COALESCE(L.upt_dt, L.reg_dt) > ? 
          ORDER BY upt_dt DESC;`;

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

  // 편지 삭제
  deleteLetter = async (userNo, letterList, tmp) => {
    try {
      let where = "";
      where = tmp ? `user_no = ? AND status = 0` : `recipient_user_no = ?`; // 임시편지 삭제면 작성자 유저 확인, 받은편지면 받은 유저 확인

      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `UPDATE tb_letter 
          SET status = 3 
          WHERE ${where} AND letter_no IN ( ? );`;

        let [deleteLetter] = await connection.query(query, [userNo, letterList]);

        return deleteLetter.changedRows;
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

  // 받은편지가 맞는지 확인(보낸사람 user_no)
  letterCheck = async (userNo, letterNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT user_no AS sendUser 
          FROM tb_letter L 
          WHERE L.recipient_user_no = ? AND L.letter_no = ? AND L.status = 1;`;

        let [letterCheck] = await connection.query(query, [userNo, letterNo]);

        return letterCheck[0];
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

  // 편지 조회
  getLetter = async (userNo, letterNo, hashLetter, readDt) => {
    try {
      let where = "";
      let params = [];
      if (hashLetter) {
        // 게스트 편지 조회
        where = `hash_no = ?`;
        params.push(hashLetter);
      } else {
        // 유저 편지 조회
        where = `L.letter_no = ? AND L.recipient_user_no = ?`;
        params.push(letterNo, userNo);
      }

      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT L.letter_no, L.user_no, L.post_no, L.recipient_user_no, Li.recipient, Li.sender, Up.user_img_url, Lc.letter_contents_no, Lc.letter_contents, P.post_description 
          FROM tb_letter L 
          JOIN tb_letter_info Li ON L.letter_no = Li.letter_no 
          JOIN tb_letter_contents Lc ON L.letter_no = Lc.letter_no AND Lc.status = 1 
          JOIN tb_user_profile Up ON L.user_no = Up.user_no 
          JOIN tb_post P ON L.post_no = P.post_no 
          WHERE ${where} AND L.status = 1;`;

        let [letter] = await connection.query(query, params);

        if (letter.length > 0) {
          for (let i in letter) {
            const queryimg = `SELECT letter_img_no, letter_img_url 
              FROM tb_letter_img 
              WHERE letter_no = ? AND status = 1;`;
            let [letterImg] = await connection.query(queryimg, letter[i].letter_no);

            letter[i].img = letterImg;
          }
        }

        // 조회 할 편지가 있으면 조회 로그 생성
        if (letter.length > 0) {
          let userLog = userNo ? userNo : 0; // 받은 유저가 읽으면 해당 유저 정보, 게스트가 읽으면 0

          const insLog = `INSERT INTO tb_letter_read_log 
            (letter_no, user_no, post_no, recipient_user_no, read_dt)
            VALUES (?, ?, ?, ?, ?);`;

          await connection.query(insLog, [letter[0].letter_no, letter[0].user_no, letter[0].post_no, userLog, readDt]);
        }

        return letter[0];
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

  // 감동메세지
  postThankMsg = async (userNo, thankMsg, letterNo, regDt) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `INSERT INTO tb_thank_msg 
          (user_no, letter_no, thank_msg, reg_dt) 
          VALUES (?, ?, ?, ?);`;

        await connection.query(query, [userNo, thankMsg, letterNo, regDt]);

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

  // 임시편지 불러오기
  getLetterTmp = async (userNo, letterNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT L.letter_no, L.user_no, L.post_no, L.status, L.stage, 
          Lc.letter_contents_no, Lc.letter_contents, 
          Li.font_no, F.font_title, 
          Li.recipient, Li.recipient_phone, Li.sender, Li.sender_phone, Li.reservation_status, Li.reservation_dt 
          FROM tb_letter L 
          JOIN tb_letter_info Li ON L.letter_no = Li.letter_no 
          JOIN tb_font F ON Li.font_no = F.font_no 
          JOIN tb_letter_contents Lc ON L.letter_no = Lc.letter_no AND Lc.status = 1 
          WHERE L.letter_no = ? AND L.user_no = ? AND L.status = 0;`;

        let [letterTmp] = await connection.query(query, [letterNo, userNo]);

        if (letterTmp.length > 0) {
          for (let i in letterTmp) {
            const queryimg = `SELECT letter_img_no, letter_img_url 
              FROM tb_letter_img 
              WHERE letter_no = ? AND status = 1;`;
            let [letterTmpImg] = await connection.query(queryimg, letterTmp[i].letter_no);

            letterTmp[i].img = letterTmpImg;
          }
        }

        return letterTmp[0];
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

  // 폰트 불러오기
  getFont = async (limit, offset) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT font_no, font_title, font_url 
          FROM tb_font 
          WHERE status = 1 
          ORDER BY view_seq 
          LIMIT ? OFFSET ?;`;

        let [font] = await connection.query(query, [limit, offset]);

        let fontData = {};
        fontData.font = font;

        // 다음 데이터가 있는지 확인
        offset = offset + limit;
        let [nextFont] = await connection.query(query, [limit, offset]);

        nextFont.length > 0 ? (fontData.nextData = 1) : (fontData.nextData = 0);

        return fontData;
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

module.exports = LetterRepository;
