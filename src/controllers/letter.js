const LetterService = require("../services/letter");

class LetterController {
  letterService = new LetterService();

  creatLetter = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;

      const letter = req.body;
      console.log("🚀 ~ file: letter.js:12 ~ LetterController ~ creatLetter= ~ letter:", letter);

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
}

module.exports = LetterController;
