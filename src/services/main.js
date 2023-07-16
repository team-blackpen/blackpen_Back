const ErrorCustom = require("../middlewares/errorCustom");

const MainRepository = require("../repositories/main");

class MainService {
  mainRepository = new MainRepository();

  getLetterListCnt = async (userNo) => {
    try {
      const getLetterListCnt = await this.mainRepository.getLetterListCnt(userNo);
      return getLetterListCnt;
    } catch (err) {
      throw new ErrorCustom(400, "메인 편지함 조회 실패");
    }
  };

  getLetterTmpList = async (userNo) => {
    try {
      const getLetterTmpList = await this.mainRepository.getLetterTmpList(userNo);
      return getLetterTmpList;
    } catch (err) {
      throw new ErrorCustom(400, "메인 임지저장 조회 실패");
    }
  };
}

module.exports = MainService;
