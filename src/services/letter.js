const dayjs = require("dayjs");

const LetterRepository = require("../repositories/letter");

class LetterService {
  letterRepository = new LetterRepository();

  creatLetter = async (userNo, letter) => {
    const now = dayjs().format("YYYY-MM-DD hh:mm:ss");
    //

    // 편지 번호는 가져오고 임시저장인지 찐저장인지 판단 한 뒤 임시저장번호가 ''인지 확인해서 있으면 바로 업데이트하고 없으면 새로만드는걸로 하면될듯
    //이때 업데이트면 reg를 upt로 바꿔서 넣어주고
    // 프론트한테 받을 데이터 더 추가로 작업해줘야ㅕ함
    let letterNo = letter.letter_no;
    const postNo = letter.post_no;
    const stage = letter.stage;
    const contents = letter.letter;
    const font = letter.font;

    if (letter.status == 0) {
      // 임시편지 저장?
      if (letterNo == "") {
        // 임시저장이면서 편지 번호가 없음
        //편지번호가 없으면 임시편지 확인 할 필요가 있나? 없으면 그냥 바로 인서트 해주고 있으면 확인 한번 하고 업데이트 하면 대나?
        // const tmpLetter_no = await this.letterRepository.getTmpLetter(userNo, postNo, letterNo); // 임시편지 확인
        // if (!tmpLetter_no) {
        const creatTmpLetter = await this.letterRepository.insTmpLetter(userNo, postNo, stage, contents, font, now); // 임시편지 없으면 내용까지만 생성
        letterNo = creatTmpLetter;
        // }
      } else {
        // 임시저장이면서 편지 번호가 있음
        const udtTmpLetter = await this.letterRepository.uptTmpLetter(letterNo, userNo, postNo, stage, contents, font, now); // 임시편지 있으면 내용까지만 수정
      }
    } else {
      // 편지 작성완료
      const info = letter.info;
      const img = letter.letter_img;
      if (letterNo == "") {
        const tmpLetter_no = await this.letterRepository.getTmpLetter(userNo); // 임시편지 확인
        if (!tmpLetter_no) {
          const creatLetter = await this.letterRepository.insLetter(userNo, postNo, stage, contents, font, info, img, now); // 임시편지 없으면 바로 편지발송 준비
          letterNo = creatLetter;
        }
      } else {
        const udtTmpLetter = await this.letterRepository.uptLetter(letterNo, userNo, postNo, stage, contents, font, info, img, now); // 임시편지 있으면 완료로 바꾸고 편지 발송 준비
      }

      // 작성 다하면 발송해야함 아이고..
    }

    return letterNo;
  };
}

module.exports = LetterService;
