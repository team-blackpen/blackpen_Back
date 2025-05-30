const MyService = require("../services/my");

class LetterController {
  myService = new MyService();

  // 서랍 내 편지함 갯수 조회
  getLetterCnt = async (req, res, next) => {
    try {
      const userNo = res.locals.user.user_no;
      const status = 1;

      const letterCnt = await this.myService.getLetterCnt(userNo, status);

      res.status(200).json({ result: 0, msg: "내 편지함 갯수 조회 성공", data: { letterCnt } });
    } catch (err) {
      next(err);
    }
  };

  // 서랍 내 임시저장 갯수 조회
  getLetterTmpCnt = async (req, res, next) => {
    try {
      const userNo = res.locals.user.user_no;
      const status = 0;

      const postWishCnt = await this.myService.getLetterCnt(userNo, status);

      res.status(200).json({ result: 0, msg: "내 임시저장 갯수 조회 성공", data: { postWishCnt } });
    } catch (err) {
      next(err);
    }
  };

  // 서랍 내 찜목록 갯수 조회
  getPostWishCnt = async (req, res, next) => {
    try {
      const userNo = res.locals.user.user_no;

      const postWishCnt = await this.myService.getPostWishCnt(userNo);

      res.status(200).json({ result: 0, msg: "내 찜목록 갯수 조회 성공", data: { postWishCnt } });
    } catch (err) {
      next(err);
    }
  };

  // 내 마음온도
  getHeartTemper = async (req, res, next) => {
    try {
      const userNo = res.locals.user.user_no;

      const heartTemper = await this.myService.getHeartTemper(userNo);

      res.status(200).json({ result: 0, msg: "내 마음온도 조회 성공", data: { heartTemper } });
    } catch (err) {
      next(err);
    }
  };

  // 닉네임 변경
  changeNickname = async (req, res, next) => {
    try {
      const userNo = res.locals.user.user_no;
      const { nickname } = req.body;

      const requestBody = JSON.stringify(req.body);
      console.log(`changeNickname -  userNo: ${userNo} / Request Body: ${requestBody}`);

      await this.myService.changeNickname(userNo, nickname);

      res.status(200).json({ result: 0, msg: "닉네임 변경 성공", data: { userNo, nickname } });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = LetterController;
