const MainService = require("../services/main");

class LetterController {
  mainService = new MainService();

  // 편지함 안읽은 편지 갯수 조회
  getLetterListCnt = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;

      const letterListCnt = await this.mainService.getLetterListCnt(userNo);

      res.status(200).json({ result: 0, msg: "메인 새로운 편지 카운트 조회 성공", data: { letterListCnt } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 임시저장 목록 3개만 조회
  getLetterTmpList = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;

      const letterTmpList = await this.mainService.getLetterTmpList(userNo);

      res.status(200).json({ result: 0, msg: "메인 임시편지 리스트 3개 조회 성공", data: { letterTmpList } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 메인 글귀 랜덤 조회
  getQuote = async (req, res, next) => {
    try {
      const quote = await this.mainService.getQuote();

      res.status(200).json({ result: 0, msg: "메인 글귀 랜덤 조회 성공", data: { quote } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 메인 기념일 조회
  getAnniversary = async (req, res, next) => {
    try {
      const anniversary = await this.mainService.getAnniversary();

      res.status(200).json({ result: 0, msg: "메인 기념일 조회 성공", data: { anniversary } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
}

module.exports = LetterController;
