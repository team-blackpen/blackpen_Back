const PostListService = require("../services/postlist");

class PostListController {
  postListService = new PostListService();

  // 카테고리 항목 조회
  getCategory = async (req, res, next) => {
    try {
      const allCategory = await this.postListService.getCategory();

      const data = { categoryList: allCategory };

      res.status(200).json({ result: 0, msg: "카테고리 리스트 조회", data });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 모든 편지지 10개씩 조회
  getAllPost = async (req, res, next) => {
    try {
      const allPost = await this.postListService.getAllPost();

      const data = { postList: allPost };

      res.status(200).json({ result: 0, msg: "편지지 전체 조회", data });
    } catch {}
  };

  // 편지지 카테고리별 조회
  getPostCategory = async (req, res, next) => {
    try {
      const cateNo = req.params.post_cate_no;
      let offset = req.query.page - 1;
      const limit = 5;
      offset = offset * limit;

      const allPostCategory = await this.postListService.getPostCategory(cateNo, limit, offset);

      const data = { cate_title: allPostCategory.cateTitle, postCategoryList: allPostCategory.postCateList };

      res.status(200).json({ result: 0, msg: "카테고리별 편지지 조회", data, nextData: allPostCategory.nextData });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 찜목록 등록 및 취소
  insPostWish = async (req, res, next) => {
    try {
      const userNo = res.locals.user.user_no;
      const { postNo } = req.body;

      const requestBody = JSON.stringify(req.body);
      console.log(`insPostWish -  userNo: ${userNo} / Request Body: ${requestBody}`);

      const insPostWish = await this.postListService.insPostWish(userNo, postNo);

      const data = { userNo: insPostWish.userNo, postNo: insPostWish.postNo };

      res.status(200).json({ result: 0, msg: insPostWish.msg, data });
    } catch (err) {
      next(err);
    }
  };

  // 찜 등록한 편지지 모두 조회
  getPostWish = async (req, res, next) => {
    try {
      const userNo = res.locals.user.user_no;
      const allPostWish = await this.postListService.getPostWish(userNo);

      const data = { postWishList: allPostWish };

      res.status(200).json({ result: 0, msg: "편지지 찜목록 조회", data });
    } catch (err) {
      next(err);
    }
  };

  // 찜목록에 내가 찜한 편지지의 카테고리 항목 조회
  getPostWishCate = async (req, res, next) => {
    try {
      const userNo = res.locals.user.user_no;
      const allPostWishCate = await this.postListService.getPostWishCate(userNo);

      const data = { postWishList: allPostWishCate };

      res.status(200).json({ result: 0, msg: "편지지 찜목록 카테고리 조회", data });
    } catch (err) {
      next(err);
    }
  };

  // 찜목록 카테고리별 조회
  getPostWishListCate = async (req, res, next) => {
    try {
      const userNo = res.locals.user.user_no;
      const cateNo = req.params.post_cate_no;

      const allPostWishList = await this.postListService.getPostWishListCate(userNo, cateNo);

      const data = { postWishList: allPostWishList };

      res.status(200).json({ result: 0, msg: "편지지 찜목록 보관함 조회", data });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = PostListController;
