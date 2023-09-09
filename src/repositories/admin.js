const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);

class AdminRepository {
  findArtist = async (atristName) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT * 
          FROM tb_artist 
          WHERE artist_name = ?;`;

        let [result] = await connection.query(query, [atristName]);

        return result;
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

  creatArtist = async (atristName) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `INSERT INTO tb_artist 
          (artist_name) 
          VALUES (?);`;

        await connection.query(query, [atristName]);

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

  insPost = async (postData) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        // 편지지 생성
        const insPost = `INSERT INTO tb_post 
          (post_title, post_description, status, reg_dt) 
          VALUES (?, ?, 1, ?);`;

        const [post] = await connection.query(insPost, [postData.post_title, postData.post_description, postData.regDt]);
        const postNo = post.insertId;

        // 편지지 작가 관계
        const insPostArtRel = `INSERT INTO tb_post_artist_rel 
          (artist_no, post_no) 
          VALUES (?, ?);`;

        await connection.query(insPostArtRel, [postData.artist_no, postNo]);

        // 편지지 카테고리 관계
        const insPostCateRel = `INSERT INTO tb_post_cate_rel 
          (post_cate_no, post_no, view_seq, status, reg_dt)
          VALUES (?, ?, (SELECT IFNULL(MAX(view_seq) + 1, 0) FROM tb_post_cate_rel Pcr WHERE post_cate_no = ?), 1, ?);`;
        await connection.query(insPostCateRel, [postData.post_cate_no, postNo, postData.post_cate_no, postData.regDt]);

        // 해쉬태그
        if (postData.hashtag.length > 0) {
          for (let i in postData.hashtag) {
            const insHash = `INSERT INTO tb_post_hashtag 
              (post_no, hashtag_title, status, view_seq, reg_dt) 
              VALUES (?, ?, 1, ?, ?);`;
            await connection.query(insHash, [postNo, postData.hashtag[i].hashtag_title, i, postData.regDt]);
          }
        }

        // 원본이미지
        if (postData.post_img.length > 0) {
          for (let i in postData.post_img) {
            const insImg = `INSERT INTO tb_post_img 
              (post_no, img_url, status, view_seq, reg_dt) 
              VALUES (?, ?, 1, ?, ?);`;
            await connection.query(insImg, [postNo, postData.post_img[i].img_url, i, postData.regDt]);
          }
        }

        // 상세이미지
        if (postData.post_detail_img.length > 0) {
          for (let i in postData.post_detail_img) {
            const insDetailImg = `INSERT INTO tb_post_detail_img 
              (post_no, img_url, status, view_seq, reg_dt) 
              VALUES (?, ?, 1, ?, ?);`;
            await connection.query(insDetailImg, [postNo, postData.post_detail_img[i].img_url, i, postData.regDt]);
          }
        }

        // 미리보기이미지
        if (postData.post_preview_img.length > 0) {
          for (let i in postData.post_preview_img) {
            const insDetailImg = `INSERT INTO tb_post_preview_img 
              (post_no, img_url, status, view_seq, reg_dt) 
              VALUES (?, ?, 1, ?, ?);`;
            await connection.query(insDetailImg, [postNo, postData.post_preview_img[i].img_url, i, postData.regDt]);
          }
        }

        await connection.commit(); // 커밋

        return;
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
}

module.exports = AdminRepository;
