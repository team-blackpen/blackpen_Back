import { LetterImage } from './letter-image.interface';

export interface LetterListItem {
  letter_no: number;
  user_no: number;
  post_no: number;
  sender: string;
  send_dt: string;
  img: LetterImage[];
  new_letter: number;
}
