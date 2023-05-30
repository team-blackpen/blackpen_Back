class PostRepository {
  allTemplate = async (userNo, startPage, endPage, categoryNo) => {
    let wish = 0,
      addWish = "",
      addJoin = "",
      addUserNo = "",
      addCate = "";

    if (userNo) {
      addWish = "Pw.status AS wish,";
      addJoin = "JOIN tb_post_wishlist Pw A ON Pw.post_no = P.post_no";
      addUserNo = "AND Pw.user_no = userNo";
    }

    if (categoryNo) {
      addCate = "AND Pc.category_no = ${categoryNo}";
    }

    const query = `SELECT post_no,  post_title, post_description, post_img,
    post_category_no, post_category_title, ${addWish} artist_no, artist_name
    FROM tb_post P
    JOIN tb_post_img Pi ON Pi.post_no = P.post_no
    JOIN tb_post_category_rel Pcr ON Pcr.post_no = P.post_no
    JOIN tb_post_category Pc ON Pc.post_category_no = Pcr.post_category_no
    ${addJoin}
    JOIN tb_artist_rel Ar ON Ar.post_no = P.post_no
    JOIN tb_artist A ON A.artist_no = Ar.artist_no
    WHERE P.status = 0 AND Pi.imgurl = 0 ${addUserNo} ${addCate}
    LIMIT ${startPage}, ${endPage}`;

    //디비 연결해서 가져오고
    const allTemplate = [
      {
        post_no: 3,
        post_title: "좁은 오솔길",
        post_description: "한줄기 시냇물이 흐르고, 울창한 나무들이 있는 편안하고 시원한 그림",
        post_img: "string",
        post_category_no: 2,
        post_category_title: "축하",
        artist_no: 4,
        artist_name: "주마등펀치",
        wish: wish,
      },
      {
        post_no: 8,
        post_title: "푸른 바다",
        post_description: "넓은 지평선이 펼쳐진 광할한 푸른빛의 바다의 모습",
        post_img: "string",
        post_category_no: 2,
        post_category_title: "축하",
        artist_no: 4,
        artist_name: "주마등펀치",
        wish: wish,
      },
    ];
    return allTemplate;
  };

  templateDetail = async (userNo, postNo) => {
    let addWish = "",
      addJoin = "",
      addUserNo = "";

    if (userNo) {
      addWish = "IF NULL (Pw.status, 0) AS wish,";
      addJoin = "LEFT JOIN tb_post_wishlist Pw A ON Pw.post_no = P.post_no";
      addUserNo = "AND Pw.user_no = userNo";
    }

    const query = `SELECT post_no,  post_title, post_description,
    post_category_no, post_category_title, ${addWish} artist_no, artist_name
    FROM tb_post P
    JOIN tb_post_category_rel Pcr ON Pcr.post_no = P.post_no
    JOIN tb_post_category Pc ON Pc.post_category_no = Pcr.post_category_no
    ${addJoin}
    JOIN tb_artist_rel Ar ON Ar.post_no = P.post_no
    JOIN tb_artist A ON A.artist_no = Ar.artist_no
    WHERE P.status = 0 AND Pi.imgurl = 0 ${addUserNo}`;

    //디비 연결해서 가져오고
    const templateDetail = {
      post_no: 3,
      post_title: "좁은 오솔길",
      post_description: "한줄기 시냇물이 흐르고, 울창한 나무들이 있는 편안하고 시원한 그림",
      post_category_no: 2,
      post_category_title: "축하",
      artist_no: 4,
      artist_name: "주마등펀치",
      wish: 0,
    };
    return templateDetail;
  };

  templateImg = async (postNo) => {
    const query = `SELECT Pi.post_image_no, Pi.img_url, Pi.veiw_seq FROM tb_post P
    JOIN tb_post_image Pi ON Pi.post_no = P.post_no
    WHERE P.post_no = ${postNo} AND P.status = 0
    ORDER BY Pi.view_seq`;

    //디비 연결해서 가져오고
    const templateImg = [
      {
        post_image_no: 3,
        img_url: "string1",
        veiw_seq: 0,
      },
      {
        post_image_no: 5,
        img_url: "string2",
        veiw_seq: 1,
      },
    ];
    return templateImg;
  };

  templateDetailImg = async (postNo) => {
    const query = `SELECT Pdi.post_detail_image_no, Pdi.img_url, Pdi.veiw_seq FROM tb_post P
    JOIN tb_post_detail_image Pdi ON Pdi.post_no = P.post_no
    WHERE P.post_no = ${postNo} AND P.status = 0
    ORDER BY Pdi.view_seq`;

    //디비 연결해서 가져오고
    const templateDetailImg = [
      {
        post_detail_image_no: 3,
        img_url: "string1",
        veiw_seq: 0,
      },
      {
        post_detail_image_no: 5,
        img_url: "string2",
        veiw_seq: 1,
      },
    ];
    return templateDetailImg;
  };

  templateHash = async (postNo) => {
    const query = `SELECT Ph.post_hashtag_no, Ph.hashtag_title, Ph.veiw_seq FROM tb_post P
    JOIN tb_post_hashg Ph ON Ph.post_no = P.post_no
    WHERE P.post_no = ${postNo} AND P.status = 0
    ORDER BY Ph.view_seq`;

    //디비 연결해서 가져오고
    const templateHash = [
      {
        post_hashtag_no: 3,
        hashtag_title: "#침착",
        veiw_seq: 0,
      },
      {
        post_hashtag_no: 5,
        hashtag_title: "#주펄",
        veiw_seq: 1,
      },
    ];
    return templateHash;
  };
}
module.exports = PostRepository;
