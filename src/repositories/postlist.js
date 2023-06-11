const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);

class PostListRepository {
  allBanner = async (today) => {
    const query = `SELECT banner_no, img_url, view_seq FROM tb_banner 
    WHERE status = 0 AND start_dt <= ${today} AND end_dt <= ${today} 
    ORDER BY view_seq`;

    //디비 커넥션 맺어서 쿼리문으로 데이터 가져오기, 아래는 임시 데이터
    const allBanner = [
      { banner_no: 7, img_url: "이미지 주소", view_seq: 0 },
      { banner_no: 2, img_url: "이미지 주소", view_seq: 1 },
    ];
    return allBanner;
  };

  allCategory = async () => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT post_cate_no, cate_title, view_seq FROM tb_post_cate
        WHERE status = 0
        ORDER BY view_seq`;

        let [results] = await connection.query(query);

        connection.release();

        return results;
      } catch (err) {
        console.log("Query Error!");
        return err;
      }
    } catch (err) {
      console.log("DB ERROR!");
      return err;
    }
  };

  allCateNo = async () => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT post_cate_no FROM tb_post_cate
        WHERE status = 0
        ORDER BY view_seq`;

        let [results] = await connection.query(query);

        connection.release();

        return results;
      } catch (err) {
        console.log("Query Error!");
        return err;
      }
    } catch (err) {
      console.log("DB ERROR!");
      return err;
    }
  };

  allPost = async (cateNo, userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT P.post_no, P.post_title, P.post_description, 
        Pi.post_img_no, Pi.img_url,
        Pc.post_cate_no, Pc.cate_title, Pc.cate_img_url, 
        A.artist_no, A.artist_name
        FROM tb_post P
        JOIN tb_post_img Pi ON Pi.post_no = P.post_no
        JOIN tb_post_cate_rel Pcr ON Pcr.post_no = P.post_no
        JOIN tb_post_cate Pc ON Pc.post_cate_no = Pcr.post_cate_no
        JOIN tb_post_artist_rel Ar ON Ar.post_no = P.post_no
        JOIN tb_artist A ON A.artist_no = Ar.artist_no 
        WHERE P.status = 0 AND Pc.post_cate_no = ? AND Pi.view_seq = 0
        ORDER BY Pc.view_seq, Pcr.view_seq
        LIMIT 10;`;

        let [results] = await connection.query(query, cateNo);

        connection.release();

        return results;
      } catch (err) {
        console.log("Query Error!");
        return err;
      }
    } catch (err) {
      console.log("DB ERROR!");
      return err;
    }
  };

  allHash = async (postNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT post_hashtag_no, hashtag_title
        FROM tb_post_hashtag
        WHERE post_no = ? AND status = 0 
        ORDER BY view_seq 
        LIMIT 2;`;

        let [results] = await connection.query(query, postNo);

        connection.release();

        return results;
      } catch (err) {
        console.log("Query Error!");
        return err;
      }
    } catch (err) {
      console.log("DB ERROR!");
      return err;
    }
  };

  allPostWish = async (userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT user_no, post_no
        FROM tb_post_wish
        WHERE user_no = ? AND status = 1;`;

        let [results] = await connection.query(query, userNo);

        connection.release();

        return results;
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

// 일단 되는거
// pool.getConnection(function (err, connection) {
//   if (err) {
//     console.log("🚀 ~ file: main.js:31 ~ mainRepository ~ err:", err);
//     throw err;
//   } else {
//     connection.query(query, function (err, results) {
//       if (err) throw err;
//       else {
//         console.log("🚀 ~ file: main.js:36 ~ mainRepository ~ connection.query ~ results:", results);
//         result = results;
//         console.log(results);
//       }
//     });
//     connection.release();
//   }
// });
