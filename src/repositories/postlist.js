const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);

class PostListRepository {
  allCategory = async (userNo) => {
    try {
      let addJoin = ``;
      let addQurey = [];
      if (userNo) {
        addJoin = `JOIN tb_post_wish Pw ON Pw.post_no = Pcr.post_no AND user_no = ?`;
        addQurey.push(userNo);
      }
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT C.post_cate_no, C.cate_title, C.view_seq 
          FROM tb_post_cate C
          JOIN tb_post_cate_rel Pcr ON Pcr.post_cate_no = C.post_cate_no
          ${addJoin}
          WHERE C.status = 0
          GROUP BY Pcr.post_cate_no
          ORDER BY C.view_seq;`;

        let [results] = await connection.query(query, addQurey);

        return results;
      } catch (err) {
        console.log("Query Error!");
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      throw err;
    }
  };

  allCateNo = async () => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT post_cate_no FROM tb_post_cate
        WHERE status = 0
        ORDER BY view_seq;`;

        let [results] = await connection.query(query);

        return results;
      } catch (err) {
        console.log("Query Error!");
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      throw err;
    }
  };

  // 편지지 전체 조회, 편지지 카테고리별 조회
  allPost = async (cateNo, limit, offset) => {
    try {
      let addLimit = "";
      limit ? (addLimit = `LIMIT ${limit} OFFSET ${offset};`) : (addLimit = "LIMIT 10;");
      // limit이 있으면 카테고리별 조회 5개씩, 전체 조회는 10개만 조회

      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT P.post_no, P.post_title, P.post_description, 
        Pi.post_img_no, Pi.img_url,
        Pc.post_cate_no, Pc.cate_title, 
        A.artist_no, A.artist_name
        FROM tb_post P
        JOIN tb_post_img Pi ON Pi.post_no = P.post_no
        JOIN tb_post_cate_rel Pcr ON Pcr.post_no = P.post_no
        JOIN tb_post_cate Pc ON Pc.post_cate_no = Pcr.post_cate_no
        JOIN tb_post_artist_rel Ar ON Ar.post_no = P.post_no
        JOIN tb_artist A ON A.artist_no = Ar.artist_no 
        WHERE P.status = 0 AND Pc.post_cate_no = ? AND Pi.view_seq = 0
        ORDER BY Pc.view_seq, Pcr.view_seq
        ${addLimit};`;

        let [results] = await connection.query(query, cateNo);

        let postObj = {};
        postObj.posts = results;

        if (limit) {
          addLimit = `LIMIT ${limit} OFFSET ${offset + limit};`;
          const nextDataQuery = `SELECT P.post_no
            FROM tb_post P
            JOIN tb_post_img Pi ON Pi.post_no = P.post_no
            JOIN tb_post_cate_rel Pcr ON Pcr.post_no = P.post_no
            JOIN tb_post_cate Pc ON Pc.post_cate_no = Pcr.post_cate_no
            WHERE P.status = 0 AND Pc.post_cate_no = ? AND Pi.view_seq = 0
            ${addLimit};`;

          let [nextData] = await connection.query(nextDataQuery, cateNo);

          nextData.length > 0 ? (postObj.nextData = 1) : (postObj.nextData = 0);
        }

        return postObj;
      } catch (err) {
        console.log("Query Error!");
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      throw err;
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

        return results;
      } catch (err) {
        console.log("Query Error!");
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      throw err;
    }
  };

  allPostWish = async (userNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT user_no, post_no
        FROM tb_post_wish
        WHERE user_no = ? AND status = 1
        ORDER BY post_no;`;

        let [results] = await connection.query(query, userNo);

        return results;
      } catch (err) {
        console.log("Query Error!");
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.log("DB ERROR!");
      throw err;
    }
  };

  insPostWish = async (userNo, postNo, now) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        const query = `SELECT post_wish_no, user_no, post_no, status
        FROM tb_post_wish
        WHERE user_no = ? AND post_no = ?;`;

        let [results] = await connection.query(query, [userNo, postNo]);
        let insPostWish = {};

        if (results.length == 0) {
          // 데이터 없으면 처음 등록이니까 바로 생성
          const insquery = `INSERT INTO tb_post_wish (user_no, post_no, status, reg_dt) VALUES (?, ?, 1, ?);`;

          await connection.query(insquery, [userNo, postNo, now]);
          insPostWish.msg = "편지지 찜목록 등록";
        } else {
          // 데이터가 있다면 등록된적은 있으니까
          results = results[0];
          let uptquery = `UPDATE tb_post_wish SET status = ?, upt_dt = ? WHERE post_wish_no = ?;`;
          let status;

          if (results.status == 1) {
            // status 1 이면 등록된거 취소
            status = 0;
            await connection.query(uptquery, [status, now, results.post_wish_no]);
            insPostWish.msg = "편지지 찜목록 삭제";
          } else {
            // status 0 이면 취소한거니까 재등록
            status = 1;
            await connection.query(uptquery, [status, now, results.post_wish_no]);
            insPostWish.msg = "편지지 찜목록 등록";
          }
        }

        insPostWish.userNo = userNo;
        insPostWish.postNo = postNo;

        await connection.commit(); // 커밋

        return insPostWish;
      } catch (err) {
        console.log("Query Error!");
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

  allPostWishList = async (userNo, cateNo) => {
    try {
      let addCateNo = "";
      let params = [userNo, cateNo];
      if (cateNo != 0) {
        addCateNo = `AND Pc.post_cate_no = ? `;
        params.push(cateNo);
      }

      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT P.post_no, P.post_title, P.post_description, 
        Pi.post_img_no, Pi.img_url,
        Pc.post_cate_no, Pc.cate_title, 
        A.artist_no, A.artist_name,
        IF(Pw.upt_dt, Pw.upt_dt, Pw.reg_dt) AS upt_dt
        FROM tb_post P
        JOIN tb_post_img Pi ON Pi.post_no = P.post_no AND Pi.view_seq = 0
        JOIN tb_post_cate_rel Pcr ON Pcr.post_no = P.post_no
        JOIN tb_post_cate Pc ON Pc.post_cate_no = Pcr.post_cate_no AND Pc.status = 0 
        JOIN tb_post_artist_rel Ar ON Ar.post_no = P.post_no
        JOIN tb_artist A ON A.artist_no = Ar.artist_no 
        JOIN tb_post_wish Pw ON Pw.post_no = P.post_no AND user_no = ?
        WHERE P.status = 0 ${addCateNo}
        ORDER BY upt_dt DESC;`;

        let [results] = await connection.query(query, params);

        return results;
      } catch (err) {
        console.log("Query Error!");
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

module.exports = PostListRepository;
