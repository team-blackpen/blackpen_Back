const dayjs = require("dayjs");
const ErrorCustom = require("../middlewares/errorCustom");

const LetterRepository = require("../repositories/letter");

class LetterService {
  letterRepository = new LetterRepository();

  creatLetter = async (userNo, letter) => {
    try {
      const now = dayjs().format("YYYY-MM-DD hh:mm:ss");

      let letterNo = letter.letterNo;
      const postNo = letter.postNo;
      const stage = letter.stage;
      const contents = letter.letterContents;
      const fontNo = letter.fontNo;
      const info = letter.info;

      if (letter.status == 0) {
        // 임시편지 저장?
        if (letterNo == 0) {
          // 임시저장이면서 편지 번호가 없음
          const creatTmpLetter = await this.letterRepository.insTmpLetter(userNo, postNo, stage, contents, fontNo, info, now); // 임시편지 없으면 내용까지만 생성

          letterNo = creatTmpLetter;
        } else {
          // 임시저장이면서 편지 번호가 있음
          const udtTmpLetter = await this.letterRepository.uptTmpLetter(letterNo, userNo, postNo, stage, contents, fontNo, info, now); // 임시편지 있으면 내용까지만 수정
        }
      } else {
        // 편지 작성완료

        const img = letter.letterImg;
        if (letterNo == 0) {
          // 작성완료이면서 편지번호 없음
          const creatLetter = await this.letterRepository.insLetter(userNo, postNo, stage, contents, fontNo, info, img, now); // 임시편지 없으면 바로 편지발송 준비
          letterNo = creatLetter;
        } else {
          // 작성완료이면서 편지번호 있음
          const udtTmpLetter = await this.letterRepository.uptLetter(letterNo, userNo, postNo, stage, contents, fontNo, info, img, now); // 임시편지 있으면 완료로 바꾸고 편지 발송 준비
        }

        // 작성 다하면 발송해야함 아이고..
      }

      return letterNo;
    } catch (err) {
      throw new ErrorCustom(400, "편지작성 실패");
    }
  };

  getLetterList = async (reUserNo) => {
    try {
      const letterList = await this.letterRepository.getLetterList(reUserNo);
      return letterList;
    } catch (err) {
      throw new ErrorCustom(400, "편지 보관함 조회 실패");
    }
  };

  getLetterTmpList = async (userNo) => {
    try {
      const letterTmpList = await this.letterRepository.getLetterTmpList(userNo);
      return letterTmpList;
    } catch (err) {
      throw new ErrorCustom(400, "임시 편지 보관함 조회 실패");
    }
  };

  deleteLetter = async (userNo, letterList, tmp) => {
    try {
      const deleteLetter = await this.letterRepository.deleteLetter(userNo, letterList, tmp);
      return deleteLetter;
    } catch (err) {
      if (tmp) {
        throw new ErrorCustom(400, "임시 편지 삭제 실패");
      } else {
        throw new ErrorCustom(400, "편지 삭제 실패");
      }
    }
  };

  getLetter = async (userNo, letterNo, hashLetter) => {
    try {
      const getLetter = await this.letterRepository.getLetter(userNo, letterNo, hashLetter);
      return getLetter;
    } catch (err) {
      throw new ErrorCustom(400, "편지 조회 실패");
    }
  };
}

module.exports = LetterService;
