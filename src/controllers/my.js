const MyService = require("../services/my");

class LetterController {
  myService = new MyService();

  // 내 편지함 갯수 조회
  getLetterCnt = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      const status = 2;

      const letterCnt = await this.myService.getLetterCnt(userNo, status);

      res.status(200).json({ result: 0, msg: "내 편지함 갯수 조회 성공", data: { letterCnt } });
    } catch (err) {
      next(err);
    }
  };

  // 내 임시저장 갯수 조회
  getLetterTmpCnt = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      const status = 0;

      const postWishCnt = await this.myService.getLetterCnt(userNo, status);

      res.status(200).json({ result: 0, msg: "내 임시저장 갯수 조회 성공", data: { postWishCnt } });
    } catch (err) {
      next(err);
    }
  };

  // 내 찜목록 갯수 조회
  getPostWishCnt = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;

      const postWishCnt = await this.myService.getPostWishCnt(userNo);

      res.status(200).json({ result: 0, msg: "내 찜목록 갯수 조회 성공", data: { postWishCnt } });
    } catch (err) {
      next(err);
    }
  };

  getHeartTemper = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;

      const heartTemper = await this.myService.getHeartTemper(userNo);

      res.status(200).json({ result: 0, msg: "내 마음온도 조회 성공", data: { heartTemper } });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = LetterController;
