const MainService = require("../services/main");

class LetterController {
  mainService = new MainService();

  // 편지함 안읽은 편지 갯수 조회
  getLetterListCnt = async (req, res, next) => {
    try {
      const userNo = res.locals.user.user_no;

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
      const userNo = res.locals.user.user_no;

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

  // 메인 글귀 리스트 조회
  getQuoteList = async (req, res, next) => {
    try {
      const quoteList = await this.mainService.getQuoteList();

      res.status(200).json({ result: 0, msg: "메인 글귀 리스트 조회 성공", data: { quoteList } });
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

  // 메인 선물하기 로그 수집
  postGift = async (req, res, next) => {
    try {
      let userNo;
      if (res.locals.user) userNo = res.locals.user.user_no;

      const { giftPrice } = req.body;

      const requestBody = JSON.stringify(req.body);
      console.log(`postGift -  userNo: ${userNo} / Request Body: ${requestBody}`);

      await this.mainService.postGift(userNo, giftPrice);

      res.status(200).json({ result: 0, msg: "메인 선물하기 로그 수집 성공" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 방문기록 로그 수집
  visitLog = async (req, res, next) => {
    try {
      const { chCd, pathCd } = req.body;

      const requestBody = JSON.stringify(req.body);
      console.log(`visitLog - Request Body: ${requestBody}`);

      await this.mainService.visitLog(chCd, pathCd);

      res.status(200).json({ result: 0, msg: "방문기록 로그 수집 성공", data: { chCd, pathCd } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
}

module.exports = LetterController;
