class PostRepository {
  allTemplate = async (userNo, startPage, endPage, categoryNo) => {
    let wish = 0;
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

  allTemplByCate = async (userNo, categoryNo, startPage, endPage) => {
    let wish = 0;
    if (userNo) {
      addWish = "Pw.status AS wish,";
      addJoin = "JOIN tb_post_wishlist Pw A ON Pw.post_no = P.post_no";
      addWhere = "AND Pw.user_no = userNo";
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
    WHERE P.status = 0 AND Pi.imgurl = 0 AND Pc.category_no = ${categoryNo} ${addWhere}
    LIMIT ${startPage}, ${endPage}`;

    //디비 연결해서 가져오고
    const allTemplByCate = [
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
    return allTemplByCate;
  };
}
module.exports = PostRepository;
