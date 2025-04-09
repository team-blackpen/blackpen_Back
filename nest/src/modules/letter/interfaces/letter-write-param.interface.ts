// 편지 생성 시 사용하는 파라미터
export interface CreateNewLetterInput {
  userNo: number;
  postNo: number;
  status: number;
  stage: number;
  contents: string;
  fontNo: number;
  info: {
    recipient: string;
    recipientPhone: string;
    sender: string;
    senderPhone: string;
    reservationStatus: number;
    reservationDt: string | null;
  };
  img: string[];
  regDt?: string;
}

// 임시 편지 수정 시 사용하는 파라미터 (letterNo, now 추가)
export interface UpdateLetterInput extends CreateNewLetterInput {
  letterNo: number;
  now: string;
}
