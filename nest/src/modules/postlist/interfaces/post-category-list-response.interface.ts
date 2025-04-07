import { PostItem } from './post-item.interface';

export interface PostCategoryListResponse {
  cate_title: string;
  postCategoryList: PostItem[];
  nextData: number;
}
