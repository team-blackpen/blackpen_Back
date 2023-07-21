const LetterService = require("../services/letter");

class LetterController {
  letterService = new LetterService();

  creatLetter = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;

      const letter = req.body;

      const letterNo = await this.letterService.creatLetter(userNo, letter);

      res.status(200).json({ result: 0, msg: "편지 작성 성공", data: { letterNo: letterNo } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 편지보관함 조회
  getLetterList = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const reUserNo = user.user_no; // 받는사람 정보

      const letterList = await this.letterService.getLetterList(reUserNo);

      res.status(200).json({ result: 0, msg: "편지 보관함 조회 성공", data: { letterList } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 임시편지보관함 조회
  getLetterTmpList = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;

      const letterTmpList = await this.letterService.getLetterTmpList(userNo);

      res.status(200).json({ result: 0, msg: "임시 편지 보관함 조회 성공", data: { letterTmpList } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 편지 리스트 삭제
  deleteLetter = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      const letterList = req.body.letterList;

      const deleteLetter = await this.letterService.deleteLetter(userNo, letterList);

      res.status(200).json({ result: 0, msg: "편지 삭제 성공", data: { deleteLetter } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 임시 편지 리스트 삭제
  deleteLetterTmp = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      const letterList = req.body.letterList;
      const tmp = true;

      const deleteLetter = await this.letterService.deleteLetter(userNo, letterList, tmp);

      res.status(200).json({ result: 0, msg: "임시 편지 삭제 성공", data: { deleteLetter } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 유저 편지 조회
  getLetter = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      let letterNo = req.query.letter_no;

      const letter = await this.letterService.getLetter(userNo, letterNo);

      res.status(200).json({ result: 0, msg: "편지 조회 성공", data: { letter } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 게스트 편지 조회
  getLetterHash = async (req, res, next) => {
    try {
      const userNo = 0;
      const letterNo = 0;
      const hashLetter = req.params.hash_letter;

      const letter = await this.letterService.getLetter(userNo, letterNo, hashLetter);

      res.status(200).json({ result: 0, msg: "게스트 편지 조회 성공", data: { letter } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 임시저장 편지 불러오기
  getLetterTmp = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      const letterNo = req.params.letter_no;

      const letterTmp = await this.letterService.getLetterTmp(userNo, letterNo);

      res.status(200).json({ result: 0, msg: "임시저장 편지 조회 성공", data: { letterTmp } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
}

module.exports = LetterController;
