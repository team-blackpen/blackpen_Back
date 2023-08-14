const ErrorCustom = require("../middlewares/errorCustom");
const MyRepository = require("../repositories/my");

class MainService {
  myRepository = new MyRepository();

  getLetterCnt = async (userNo, status) => {
    try {
      const getLetterCnt = await this.myRepository.getLetterCnt(userNo, status);
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
}

module.exports = MainService;
