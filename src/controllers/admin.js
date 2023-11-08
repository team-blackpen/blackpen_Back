const jwt = require("jsonwebtoken");
const ErrorCustom = require("../middlewares/errorCustom");
const AdminService = require("../services/admin");

class AdminController {
  adminService = new AdminService();

  adminCate = async (req, res, next) => {
    try {
      const allCategory = await this.adminService.adminCate();

      const data = { categoryList: allCategory };

      res.status(200).json({ result: 0, msg: "카테고리 항목 조회", data });
    } catch (err) {
      next(err);
    }
  };

  creatArtist = async (req, res, next) => {
    try {
      const atristName = req.body.artistName;
      const atristDescription = req.body.atristDescription;
      let userNo = res.locals.user.user_no;
      let nickname = res.locals.user.nickname;
      let user_img_url = res.locals.user.user_img_url;

      const requestBody = JSON.stringify(req.body);
      console.log(`creatArtist -  userNo: ${userNo} / Request Body: ${requestBody}`);

      if (atristName) {
        const artistNo = await this.adminService.creatArtist(atristName, atristDescription, userNo);

        const accessToken = jwt.sign({ user_no: userNo, nickname: nickname, user_img_url: user_img_url, artist_no: artistNo, artist_name: atristName }, process.env.JWT_KEY, { expiresIn: "3h" });

        let result = { user_no: userNo, accessToken, nickname, user_img_url, artist_no: artistNo, artist_name: atristName };
        return res.status(200).json({ result: 0, msg: "작가 등록", data: result });
      }
      return res.status(400).json({ result: 1, errMsg: "작가 등록 실패" });
    } catch (err) {
      next(err);
    }
  };

  creatPost = async (req, res, next) => {
    try {
      const postData = req.body;
      postData.userNo = res.locals.user.user_no;

      const requestBody = JSON.stringify(req.body);
      console.log(`creatPost -  userNo: ${postData.userNo} / Request Body: ${requestBody}`);

      // 비공개 편지지 등록 시 제목과 설명 추가
      if (postData.status == 2) {
        postData.postTitle = "비공개 편지지";
        postData.postDescription = `${postData.userNo}의 비공개 편지지`;
      }

      // 공개 편지지 등록시 유효성 검사
      if (postData.status == 3) {
        if (!postData.artistNo) throw new ErrorCustom(400, "작가 정보가 없습니다");

        if (postData.postCateNo.length > 2) throw new ErrorCustom(400, "카테고리는 2개까지 설정 가능합니다");
        postData.postCateNo.push(1); // NEW 카테고리 자동 추가

        if (postData.hashtag.length > 2) throw new ErrorCustom(400, "해시태그는 2개까지 설정 가능합니다");

        for (let i in postData.hashtag) {
          if (postData.hashtag[i].hashtagTitle.length > 3) throw new ErrorCustom(400, "해시태그는 3글자 이내 까지 설정 가능합니다");
        }

        if (postData.postImg.length < 1) throw new ErrorCustom(400, "편지지 원본 이미지가 없습니다");
        if (postData.postPreviewImg.length < 1) throw new ErrorCustom(400, "편지지 미리보기 이미지가 없습니다");
      }

      const newPost = await this.adminService.creatPost(postData);

      const data = { postNo: newPost };

      res.status(200).json({ result: 0, msg: "편지지 템플릿 등록", data });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = AdminController;
