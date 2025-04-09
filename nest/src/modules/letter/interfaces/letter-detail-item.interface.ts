import { LetterImage } from './letter-image.interface';

export interface LetterDetailItem {
  letter_no: number;
  user_no: number;
  post_no: number;
  recipient_user_no: number;
  recipient: string;
  sender: string;
  user_img_url: string;
  letter_contents_no: number;
  letter_contents: string;
  post_description: string;
  img: LetterImage[];
  post_preview_img: { [key: string]: any }[]; // getPostDetailEtc 결과 타입
}
