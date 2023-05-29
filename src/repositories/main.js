class mainRepository {
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
    const query = `SELECT post_category_no, post_category_title, view_seq FROM tb_post_category 
    WHERE status = 0 
    ORDER BY view_seq`;

    //디비 커넥션 맺어서 쿼리문으로 데이터 가져오기, 아래는 임시 데이터
    const allCategory = [
      { post_category_no: 7, post_category_title: "생일", view_seq: 0 },
      { post_category_no: 2, post_category_title: "축하", view_seq: 1 },
    ];
    return allCategory;
  };
}

module.exports = mainRepository;
