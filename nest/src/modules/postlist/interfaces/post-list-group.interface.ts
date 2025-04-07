import { PostItem } from './post-item.interface';

export interface PostListGroup {
  posts: PostItem[];
  nextData: number;
}
