import { LetterImage } from './letter-image.interface';

export interface LetterTmp {
  letter_no: number;
  user_no: number;
  post_no: number;
  status: number;
  stage: number;
  letter_contents_no: number;
  letter_contents: string;
  font_no: number;
  font_title: string;
  recipient: string;
  recipient_phone: string;
  sender: string;
  sender_phone: string;
  reservation_status: number | null;
  reservation_dt: string | null;
  img: LetterImage[];
}
