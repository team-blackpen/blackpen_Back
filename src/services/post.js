const PostRepository = require("../repositories/post");

class PostService {
  postRepository = new PostRepository();

  getPostDetail = async (userNo, postNo) => {
    const post = await this.postRepository.postDetail(userNo, postNo);
    const postHashtag = await this.postRepository.postEtc(postNo, "hashtag");
    const postImg = await this.postRepository.postEtc(postNo, "postImg");
    const postDetailImg = await this.postRepository.postEtc(postNo, "postDetailImg");
    post.hashtag = postHashtag;
    post.post_img = postImg;
    post.post_detail_img = postDetailImg;

    return post;
  };
}

module.exports = PostService;
