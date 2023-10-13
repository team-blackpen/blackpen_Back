const ErrorCustom = require("../middlewares/errorCustom");
const PostRepository = require("../repositories/post");

class PostService {
  postRepository = new PostRepository();

  getPostDetail = async (userNo, postNo) => {
    try {
      const post = await this.postRepository.postDetail(userNo, postNo);
      if (!post) throw new ErrorCustom(400, "존재하지 않는 편지지 입니다");
      const postHashtag = await this.postRepository.postEtc(postNo, "hashtag");
      const postImg = await this.postRepository.postEtc(postNo, "postImg");
      const postDetailImg = await this.postRepository.postEtc(postNo, "postDetailImg");
      const postPreviewImg = await this.postRepository.postEtc(postNo, "postPreviewImg");
      post.hashtag = postHashtag;
      post.post_img = postImg;
      post.post_detail_img = postDetailImg;
      post.post_preview_img = postPreviewImg;

      return post;
    } catch (err) {
      if (err.code == 400) throw err;
      throw new ErrorCustom(400, "편지지 상세 조회 실패");
    }
  };
}

module.exports = PostService;
