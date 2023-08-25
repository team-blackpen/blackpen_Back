const ErrorCustom = require("../middlewares/errorCustom");

const MainRepository = require("../repositories/main");

class MainService {
  mainRepository = new MainRepository();

  getLetterListCnt = async (userNo) => {
    try {
      const getLetterListCnt = await this.mainRepository.getLetterListCnt(userNo);
      return getLetterListCnt;
    } catch (err) {
      throw new ErrorCustom(400, "메인 새로운 편지 카운트 조회 실패");
    }
  };

  getLetterTmpList = async (userNo) => {
    try {
      const getLetterTmpList = await this.mainRepository.getLetterTmpList(userNo);
      return getLetterTmpList;
    } catch (err) {
      throw new ErrorCustom(400, "메인 임시편지 리스트 3개 조회 실패");
    }
  };
}

module.exports = MainService;
