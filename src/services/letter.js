const dayjs = require("dayjs");

const LetterRepository = require("../repositories/letter");

class LetterService {
  letterRepository = new LetterRepository();

  creatLetter = async (userNo, letter) => {
    const regDt = dayjs().format("YYYY-MM-DD hh:mm:ss");

    const letterNo = letter.letter_no;
    const postNo = letter.post_no;
    const contents = letter.letter;
    const font = letter.font;

    if (letter.status == 0) {
      // 임시편지 저장?
      const tmpLetter_no = await this.letterRepository.getTmpLetter(userNo, postNo, letterNo); // 임시편지 확인
      if (!tmpLetter_no) {
        const creatTmpLetter = await this.letterRepository.insTmpLetter(userNo, postNo, contents, font, regDt); // 임시편지 없으면 내용까지만 생성
      } else {
        const udTmpLetter = await this.letterRepository.updTmpLetter(tmpLetter_no, contents, font, regDt); // 임시편지 있으면 내용까지만 수정
      }
    } else {
      // 편지 작성완료
      const info = letter.info;
      const img = letter.letter_img;
      const tmpLetter_no = await this.letterRepository.getTmpLetter(userNo); // 임시편지 확인
      if (!tmpLetter_no) {
        const creatLetter = await this.letterRepository.insLetter(userNo, postNo, contents, font, info, img, regDt); // 임시편지 없으면 바로 편지발송 준비
      } else {
        const udTmpLetter = await this.letterRepository.updLetter(tmpLetter_no, contents, font, info, img, regDt); // 임시편지 있으면 완료로 바꾸고 편지 발송 준비
      }
    }

    return;
  };
}

module.exports = LetterService;
