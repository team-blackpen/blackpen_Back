import { Hashtag } from './hashtag.interface';

export interface PostItem {
  post_no: number;
  post_title: string;
  post_description: string;
  post_img_no: number;
  img_url: string;
  post_cate_no: number;
  cate_title: string;
  artist_no: number;
  artist_name: string;
  hashtag: Hashtag[];
}
