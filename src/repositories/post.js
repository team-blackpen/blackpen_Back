const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);

class PostRepository {
  // 편지지 상세페이지(편지지, 작가)
  postDetail = async (userNo, postNo) => {
    try {
      let addWish = "0 AS wish,",
        addJoin = "",
        params = [postNo];

      if (userNo) {
        addWish = "IFNULL (Pw.status, 0) AS wish,";
        addJoin = "LEFT JOIN tb_post_wish Pw ON Pw.post_no = P.post_no AND Pw.user_no = ?";
        params = [userNo, postNo];
      }

      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT P.post_no, P.post_title, P.post_description, 
          ${addWish} 
          A.artist_no, A.artist_name 
          FROM tb_post P 
          JOIN tb_post_artist_rel Ar ON Ar.post_no = P.post_no 
          JOIN tb_artist A ON A.artist_no = Ar.artist_no 
          ${addJoin} 
          WHERE P.post_no = ? AND P.status = 1;`;

        let [results] = await connection.query(query, params);

        return results[0];
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

  // 편지지 상세페이지(해시태그, 편지지 원본이미지, 상세이미지, 미리보기이미지)
  postEtc = async (postNo, table) => {
    try {
      let query;
      switch (table) {
        case "hashtag":
          query = `SELECT Ph.post_hashtag_no, Ph.hashtag_title 
            FROM tb_post P 
            JOIN tb_post_hashtag Ph ON Ph.post_no = P.post_no AND Ph.status = 1 
            WHERE P.post_no = ? AND P.status IN (1, 2, 3) 
            ORDER BY Ph.view_seq;`;
          break;

        case "postImg":
          query = `SELECT Pi.post_img_no, Pi.img_url 
          FROM tb_post P
          JOIN tb_post_img Pi ON Pi.post_no = P.post_no AND Pi.status = 1
          WHERE P.post_no = ? AND P.status IN (1, 2, 3) 
          ORDER BY Pi.view_seq;`;
          break;

        case "postDetailImg":
          query = `SELECT Pdi.post_detail_img_no, Pdi.img_url 
          FROM tb_post P
          JOIN tb_post_detail_img Pdi ON Pdi.post_no = P.post_no AND Pdi.status = 1
          WHERE P.post_no = ? AND P.status IN (1, 2, 3) 
          ORDER BY Pdi.view_seq;`;
          break;

        case "postPreviewImg":
          query = `SELECT Ppi.post_preview_img_no, Ppi.img_url 
          FROM tb_post P
          JOIN tb_post_preview_img Ppi ON Ppi.post_no = P.post_no AND Ppi.status = 1
          WHERE P.post_no = ? AND P.status IN (1, 2, 3) 
          ORDER BY Ppi.view_seq;`;
          break;

        default:
          break;
      }

      const connection = await pool.getConnection(async (corn) => corn);
      try {
        let [results] = await connection.query(query, [postNo]);

        return results;
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

module.exports = PostRepository;
