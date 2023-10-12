const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbconfig");
const pool = mysql.createPool(dbConfig);

class PostListRepository {
  // 카테고리 항목 조회
  allCategory = async (userNo) => {
    try {
      let addJoin = ``;
      let addQurey = [];

      // userNo가 있는건 찜목록의 카테고리 항목 조회
      if (userNo) {
        addJoin = `JOIN tb_post_wish Pw ON Pw.post_no = Pcr.post_no AND user_no = ?`;
        addQurey.push(userNo);
      }
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT C.post_cate_no, C.cate_title, C.view_seq 
          FROM tb_post_cate C 
          JOIN tb_post_cate_rel Pcr ON C.post_cate_no = Pcr.post_cate_no 
          JOIN tb_post P ON P.post_no = Pcr.post_no AND P.status = 1 
          ${addJoin} 
          WHERE C.status = 1 
          GROUP BY Pcr.post_cate_no 
          ORDER BY C.view_seq;`;

        let [results] = await connection.query(query, addQurey);

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

  // 사용 중인 카테고리 번호 조회
  allCateNo = async () => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT post_cate_no 
          FROM tb_post_cate 
          WHERE status = 1 
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

  // 편지지 전체 조회 10개, 편지지 카테고리별 조회 5개씩
  allPost = async (cateNo, limit, offset) => {
    try {
      let addLimit = "";
      let addOrder = "";

      // limit이 있으면 카테고리별 조회 5개씩, 전체 조회는 10개만 조회
      limit ? (addLimit = `LIMIT ${limit} OFFSET ${offset}`) : (addLimit = "LIMIT 10");
      // cate 가 NEW면 생성 순서대로 보여주고 그게 아니면 랜덤으로 보여줌
      // cateNo == 1 ? (addOrder = `P.reg_dt DESC, Pc.view_seq, Pcr.view_seq`) : (addOrder = `RAND()`);
      addOrder = `P.reg_dt DESC, Pc.view_seq, Pcr.view_seq`;

      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT P.post_no, P.post_title, P.post_description, 
          Pi.post_img_no, Pi.img_url,
          Pc.post_cate_no, Pc.cate_title, 
          A.artist_no, A.artist_name 
          FROM tb_post P 
          JOIN tb_post_img Pi ON Pi.post_no = P.post_no AND Pi.view_seq = 0 
          JOIN tb_post_cate_rel Pcr ON Pcr.post_no = P.post_no AND Pcr.status = 1 
          JOIN tb_post_cate Pc ON Pc.post_cate_no = Pcr.post_cate_no AND Pc.post_cate_no = ? 
          JOIN tb_post_artist_rel Ar ON Ar.post_no = P.post_no 
          JOIN tb_artist A ON A.artist_no = Ar.artist_no 
          WHERE P.status = 1 
          ORDER BY ${addOrder} 
          ${addLimit};`;

        let [results] = await connection.query(query, cateNo);

        let postObj = {};
        postObj.posts = results;

        // 카테고리별 조회는 무한 스크롤로 다음 데이터가 있으면 1을 전달 해당 데이터가 마지막이라면 0을 전달
        if (limit) {
          addLimit = `LIMIT ${limit} OFFSET ${offset + limit};`;
          const nextDataQuery = `SELECT P.post_no 
            FROM tb_post P 
            JOIN tb_post_img Pi ON Pi.post_no = P.post_no 
            JOIN tb_post_cate_rel Pcr ON Pcr.post_no = P.post_no 
            JOIN tb_post_cate Pc ON Pc.post_cate_no = Pcr.post_cate_no 
            WHERE P.status = 1 AND Pc.post_cate_no = ? AND Pi.view_seq = 0 
            ${addLimit};`;

          let [nextData] = await connection.query(nextDataQuery, cateNo);

          nextData.length > 0 ? (postObj.nextData = 1) : (postObj.nextData = 0);
        }

        return postObj;
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

  // 편지지 해시태그 조회
  allHash = async (postNo) => {
    try {
      const connection = await pool.getConnection(async (corn) => corn);
      try {
        const query = `SELECT post_hashtag_no, hashtag_title 
          FROM tb_post_hashtag 
          WHERE post_no = ? AND status = 1  
          ORDER BY view_seq 
          LIMIT 2;`;

        let [results] = await connection.query(query, postNo);

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

  // 찜목록 등록 및 해제
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
          const insquery = `INSERT INTO tb_post_wish 
            (user_no, post_no, status, reg_dt) 
            VALUES (?, ?, 1, ?);`;

          await connection.query(insquery, [userNo, postNo, now]);
          insPostWish.msg = "편지지 찜목록 등록";
        } else {
          // 데이터가 있다면 등록된적은 있으니까
          results = results[0];
          let uptquery = `UPDATE tb_post_wish 
            SET status = ?, upt_dt = ? 
            WHERE post_wish_no = ?;`;

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

  // 찜 등록한 편지지 모두 조회
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

  // 찜목록 카테고리별 조회
  allPostWishListCate = async (userNo, cateNo) => {
    try {
      let addCateNo = "";
      let params = [userNo, cateNo];
      let addGroupBy = "";

      if (cateNo == 0) {
        addGroupBy = `GROUP BY P.post_no`;
      } else {
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
          JOIN tb_post_cate Pc ON Pc.post_cate_no = Pcr.post_cate_no AND Pc.status = 1 
          JOIN tb_post_artist_rel Ar ON Ar.post_no = P.post_no 
          JOIN tb_artist A ON A.artist_no = Ar.artist_no 
          JOIN tb_post_wish Pw ON Pw.post_no = P.post_no AND user_no = ? 
          WHERE P.status = 1 ${addCateNo} 
          ${addGroupBy} 
          ORDER BY upt_dt DESC;`;

        let [results] = await connection.query(query, params);

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

module.exports = PostListRepository;
