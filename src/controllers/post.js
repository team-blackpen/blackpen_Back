const PostService = require("../services/post");

class PostController {
  postService = new PostService();

  // 편지지 상세페이지
  getPostDetail = async (req, res, next) => {
    try {
      let userNo;
      if (res.locals.user) {
        const user = res.locals.user;
        userNo = user.user_no;
      }
      const postNo = req.params.post_no;

      const getPostDetail = await this.postService.getPostDetail(userNo, postNo);

      res.status(200).json({ result: 0, msg: "편지지 상세 조회", data: getPostDetail });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = PostController;
