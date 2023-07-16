const MainService = require("../services/main");

class LetterController {
  mainService = new MainService();

  // 편지한 안읽은 편지 갯수 조회
  getLetterListCnt = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;

      const letterListCnt = await this.mainService.getLetterListCnt(userNo);

      res.status(200).json({ result: 0, msg: "메인 편지함 조회 성공", data: { letterListCnt } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
}

module.exports = LetterController;
