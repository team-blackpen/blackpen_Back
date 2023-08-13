const PostListService = require("../services/postlist");

class PostListController {
  postListService = new PostListService();

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

  getAllPost = async (req, res, next) => {
    try {
      const allPost = await this.postListService.getAllPost();

      const data = { postList: allPost };

      res.status(200).json({ result: 0, msg: "편지지 전체 조회", data });
    } catch {}
  };

  getPostWishCate = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      const allPostWishCate = await this.postListService.getPostWishCate(userNo);

      const data = { postWishList: allPostWishCate };

      res.status(200).json({ result: 0, msg: "편지지 찜목록 카테고리 조회", data });
    } catch (err) {
      next(err);
    }
  };

  getPostWish = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      const allPostWish = await this.postListService.getPostWish(userNo);

      const data = { postWishList: allPostWish };

      res.status(200).json({ result: 0, msg: "편지지 찜목록 조회", data });
    } catch (err) {
      next(err);
    }
  };

  getPostCategory = async (req, res, next) => {
    try {
      const cateNo = req.params.post_cate_no;
      let offset = req.query.page - 1;
      const limit = 5;
      offset = offset * limit;

      const allPostCategory = await this.postListService.getPostCategory(cateNo, limit, offset);

      const data = { cate_title: allPostCategory.cateTitle, postCategoryList: allPostCategory.postCateList };

      res.status(200).json({ result: 0, msg: "카테고리별 편지지 조회", data });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 찜목록 등록 및 취소
  insPostWish = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      const { postNo } = req.body;

      const insPostWish = await this.postListService.insPostWish(userNo, postNo);

      const data = { userNo: insPostWish.userNo, postNo: insPostWish.postNo };

      res.status(200).json({ result: 0, msg: insPostWish.msg, data });
    } catch (err) {
      next(err);
    }
  };

  getPostWishList = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      const cateNo = req.params.post_cate_no;

      const allPostWishList = await this.postListService.getPostWishList(userNo, cateNo);

      const data = { postWishList: allPostWishList };

      res.status(200).json({ result: 0, msg: "편지지 찜목록 보관함 조회", data });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = PostListController;
