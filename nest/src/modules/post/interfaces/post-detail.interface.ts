export interface PostDetail {
  post_no: number;
  post_title: string;
  post_description: string;
  wish: number;
  artist_no: number;
  artist_name: string;
  hashtag: {
    post_hashtag_no: number;
    hashtag_title: string;
  }[];
  post_img: {
    post_img_no: number;
    img_url: string;
  }[];
  post_detail_img: {
    post_detail_img_no: number;
    img_url: string;
  }[];
  post_preview_img: {
    post_preview_img_no: number;
    img_url: string;
  }[];
}
