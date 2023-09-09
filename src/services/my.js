const ErrorCustom = require("../middlewares/errorCustom");
const MyRepository = require("../repositories/my");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

class MainService {
  myRepository = new MyRepository();

  getLetterCnt = async (userNo, status) => {
    try {
      const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD HH:mm:ss");

      const getLetterCnt = await this.myRepository.getLetterCnt(userNo, status, yesterday);
      return getLetterCnt;
    } catch (err) {
      throw new ErrorCustom(400, "내 편지함 / 임시저장 갯수 조회 실패");
    }
  };

  getPostWishCnt = async (userNo) => {
    try {
      const getPostWishCnt = await this.myRepository.getPostWishCnt(userNo);
      return getPostWishCnt;
    } catch (err) {
      throw new ErrorCustom(400, "내 찜목록 갯수 조회 실패");
    }
  };

  getHeartTemper = async (userNo) => {
    try {
      const getHeartTemper = await this.myRepository.getHeartTemper(userNo);
      return getHeartTemper;
    } catch (err) {
      throw new ErrorCustom(400, "내 마음온도 조회 실패");
    }
  };

  changeNickname = async (userNo, nickname) => {
    try {
      const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

      const changeNickname = await this.myRepository.changeNickname(userNo, nickname, now);
      return changeNickname;
    } catch (err) {
      throw new ErrorCustom(400, "닉네임 변경 실패");
    }
  };
}

module.exports = MainService;
