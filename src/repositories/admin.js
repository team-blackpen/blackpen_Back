const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);

class AdminRepository {
  // 사용 중인 카테고리 조회(view_seq != 0 NEW 제외)
  getAdminCate = async () => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT post_cate_no, cate_title
          FROM tb_post_cate 
          WHERE status = 1 AND view_seq > 0
          ORDER BY view_seq;`;

        let [results] = await connection.query(query);

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

  findArtist = async (atristName) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT artist_name 
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

  findArtistUser = async (userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT user_no 
          FROM tb_artist 
          WHERE user_no = ?;`;

        let [result] = await connection.query(query, [userNo]);

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

  creatArtist = async (atristName, atristDescription, userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `INSERT INTO tb_artist 
          (artist_name, artist_description, user_no) 
          VALUES (?, ?, ?);`;

        const [artist] = await connection.query(query, [atristName, atristDescription, userNo]);
        let artistNo = artist.insertId;

        return artistNo;
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
          VALUES (?, ?, ?, ?);`;

        const [post] = await connection.query(insPost, [postData.postTitle, postData.postDescription, postData.status, postData.regDt]);
        const postNo = post.insertId;

        // 비공개 편지지가 아닐때 작가, 카테고리, 해시태그 등록
        if (postData.status != 2) {
          // 편지지 작가 관계
          const insPostArtRel = `INSERT INTO tb_post_artist_rel 
            (artist_no, post_no) 
            VALUES (?, ?);`;

          await connection.query(insPostArtRel, [postData.artistNo, postNo]);

          // 편지지 카테고리 관계
          if (postData.postCateNo.length > 0) {
            for (let i in postData.postCateNo) {
              const insPostCateRel = `INSERT INTO tb_post_cate_rel 
                (post_cate_no, post_no, view_seq, status, reg_dt)
                VALUES (?, ?, (SELECT IFNULL(MAX(view_seq) + 1, 0) FROM tb_post_cate_rel Pcr WHERE post_cate_no = ?), 1, ?);`;
              await connection.query(insPostCateRel, [postData.postCateNo[i], postNo, postData.postCateNo[i], postData.regDt]);
            }
          }

          // 해쉬태그
          if (postData.hashtag.length > 0) {
            for (let i in postData.hashtag) {
              const insHash = `INSERT INTO tb_post_hashtag 
                (post_no, hashtag_title, status, view_seq, reg_dt) 
                VALUES (?, ?, 1, ?, ?);`;
              await connection.query(insHash, [postNo, postData.hashtag[i].hashtagTitle, i, postData.regDt]);
            }
          }
        }

        // 원본이미지
        if (postData.postImg.length > 0) {
          for (let i in postData.postImg) {
            const insImg = `INSERT INTO tb_post_img 
              (post_no, img_url, status, view_seq, reg_dt) 
              VALUES (?, ?, 1, ?, ?);`;
            await connection.query(insImg, [postNo, postData.postImg[i].imgUrl, i, postData.regDt]);
          }
        }

        // 상세이미지
        if (postData.postDetailImg.length > 0) {
          for (let i in postData.postDetailImg) {
            const insDetailImg = `INSERT INTO tb_post_detail_img 
              (post_no, img_url, status, view_seq, reg_dt) 
              VALUES (?, ?, 1, ?, ?);`;
            await connection.query(insDetailImg, [postNo, postData.postDetailImg[i].imgUrl, i, postData.regDt]);
          }
        }

        // 미리보기이미지
        if (postData.postPreviewImg.length > 0) {
          for (let i in postData.postPreviewImg) {
            const insDetailImg = `INSERT INTO tb_post_preview_img 
              (post_no, img_url, status, view_seq, reg_dt) 
              VALUES (?, ?, 1, ?, ?);`;
            await connection.query(insDetailImg, [postNo, postData.postPreviewImg[i].imgUrl, i, postData.regDt]);
          }
        }

        await connection.commit(); // 커밋

        return postNo;
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
