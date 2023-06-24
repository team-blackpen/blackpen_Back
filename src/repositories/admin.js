const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);
const ErrorCustom = require("../middlewares/errorCustom");

class AdminRepository {
  findArtist = async (atristName) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT * FROM tb_artist WHERE artist_name = ?`;

        let [results] = await connection.query(query, [atristName]);

        connection.release();

        return results;
      } catch (err) {
        console.log("Query Error!", err);
        throw new ErrorCustom(500, "Query Error!");
      }
    } catch (err) {
      console.log("DB ERROR!", err);
      throw new ErrorCustom(500, "DB ERROR!");
    }
  };

  creatArtist = async (atristName) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `INSERT INTO tb_artist (artist_name) VALUES (?);`;

        let [results] = await connection.query(query, [atristName]);

        connection.release();

        return results;
      } catch (err) {
        console.log("Query Error!", err);
        throw new ErrorCustom(500, "Query Error!");
      }
    } catch (err) {
      console.log("DB ERROR!", err);
      throw new ErrorCustom(500, "DB ERROR!");
    }
  };

  creatPost = async (postData) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `INSERT INTO tb_post (post_title, post_description, status, reg_dt) VALUES (?, ?, 0, ?);`;

        let [results] = await connection.query(query, [postData.post_title, postData.post_description, postData.regDt]);

        connection.release();

        return results;
      } catch (err) {
        console.log("Query Error!", err);
        throw new ErrorCustom(500, "Query Error!");
      }
    } catch (err) {
      console.log("DB ERROR!", err);
      throw new ErrorCustom(500, "DB ERROR!");
    }
  };

  creatArtistRel = async (postData, postNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `INSERT INTO tb_post_artist_rel (artist_no, post_no) VALUES (?, ?);`;

        let [results] = await connection.query(query, [postData.artist_no, postNo]);

        connection.release();

        return results;
      } catch (err) {
        console.log("Query Error!", err);
        throw new ErrorCustom(500, "Query Error!");
      }
    } catch (err) {
      console.log("DB ERROR!", err);
      throw new ErrorCustom(500, "DB ERROR!");
    }
  };

  creatCateRel = async (postData, postNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `INSERT INTO tb_post_cate_rel 
        (post_cate_no, post_no, view_seq, status, reg_dt) 
        VALUES 
        (?, ?, (SELECT IFNULL(MAX(view_seq) + 1, 0) FROM tb_post_cate_rel Pcr WHERE post_cate_no = ?), 0, ?);`;

        let [results] = await connection.query(query, [postData.post_cate_no, postNo, postData.post_cate_no, postData.regDt]);

        connection.release();

        return results;
      } catch (err) {
        console.log("Query Error!", err);
        throw new ErrorCustom(500, "Query Error!");
      }
    } catch (err) {
      console.log("DB ERROR!", err);
      throw new ErrorCustom(500, "DB ERROR!");
    }
  };

  creatEtc = async (postNo, table, column, regDt) => {
    try {
      let query;
      switch (table) {
        case "hashtag":
          query = `INSERT INTO tb_post_hashtag (post_no, hashtag_title, status, view_seq, reg_dt) 
          VALUES (?, ?, 0, (SELECT IFNULL(MAX(view_seq) + 1, 0) FROM tb_post_hashtag Ph WHERE post_no = ?), ?);`;
          break;

        case "postImg":
          query = `INSERT INTO tb_post_img (post_no, img_url, status, view_seq, reg_dt) 
          VALUES (?, ?, 0, (SELECT IFNULL(MAX(view_seq) + 1, 0) FROM tb_post_img Pi WHERE post_no = ?), ?);`;
          break;

        case "postDetailImg":
          query = `INSERT INTO tb_post_detail_img (post_no, img_url, status, view_seq, reg_dt) 
          VALUES (?, ?, 0, (SELECT IFNULL(MAX(view_seq) + 1, 0) FROM tb_post_detail_img Pdi WHERE post_no = ?), ?);`;
          break;
        default:
          break;
      }

      const connection = await pool.getConnection(async (corn) => corn);
      try {
        let [results] = await connection.query(query, [postNo, column, postNo, regDt]);

        connection.release();

        return results;
      } catch (err) {
        console.log("Query Error!", err);
        throw new ErrorCustom(500, "Query Error!");
      }
    } catch (err) {
      console.log("DB ERROR!", err);
      throw new ErrorCustom(500, "DB ERROR!");
    }
  };

  insPost = async (postData) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        const insPost = `INSERT INTO tb_post (post_title, post_description, status, reg_dt) VALUES (?, ?, 0, ?);`;
        const [post] = await connection.query(insPost, [postData.post_title, postData.post_description, postData.regDt]);
        const postNo = post.insertId;

        const insPostArtRel = `INSERT INTO tb_post_artist_rel (artist_no, post_no) VALUES (?, ?);`;
        await connection.query(insPostArtRel, [postData.artist_no, postNo]);

        const insPostCateRel = `INSERT INTO tb_post_cate_rel (post_cate_no, post_no, view_seq, status, reg_dt)
        VALUES (?, ?, (SELECT IFNULL(MAX(view_seq) + 1, 0) FROM tb_post_cate_rel Pcr WHERE post_cate_no = ?), 0, ?);`;
        await connection.query(insPostCateRel, [postData.post_cate_no, postNo, postData.post_cate_no, postData.regDt]);

        if (postData.hashtag.length > 0) {
          for (let i in postData.hashtag) {
            const insHash = `INSERT INTO tb_post_hashtag (post_no, hashtag_title, status, view_seq, reg_dt) VALUES (?, ?, 0, ?, ?);`;
            await connection.query(insHash, [postNo, postData.hashtag[i].hashtag_title, i, postData.regDt]);
          }
        }

        if (postData.post_img.length > 0) {
          for (let i in postData.hashtag) {
            const insImg = `INSERT INTO tb_post_img (post_no, img_url, status, view_seq, reg_dt) VALUES (?, ?, 0, ?, ?);`;
            await connection.query(insImg, [postNo, postData.post_img[i].img_url, i, postData.regDt]);
          }
        }

        if (postData.post_detail_img.length > 0) {
          for (let i in postData.hashtag) {
            const insDetailImg = `INSERT INTO tb_post_detail_img (post_no, img_url, status, view_seq, reg_dt) VALUES (?, ?, 0, ?, ?);`;
            await connection.query(insDetailImg, [postNo, postData.post_detail_img[i].img_url, i, postData.regDt]);
          }
        }

        await connection.commit(); // 커밋

        return;
      } catch (err) {
        console.log(err);
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

module.exports = AdminRepository;
