const ErrorCustom = require("../middlewares/errorCustom");
const MainRepository = require("../repositories/main");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

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

  getQuote = async () => {
    try {
      const quoteList = await this.mainRepository.getQuote();

      let max = quoteList.length; // 0 ~ length 글귀가 추가되도 수정할 필요 없음
      const randomInt = Math.floor(Math.random() * max);
      let quote = quoteList[randomInt];

      return quote;
    } catch (err) {
      throw new ErrorCustom(400, "메인 글귀 랜덤 조회 실패");
    }
  };

  getAnniversary = async () => {
    try {
      const today = dayjs().format("YYYYMMDD");

      const anniversary = await this.mainRepository.getAnniversary(today);

      return anniversary;
    } catch (err) {
      throw new ErrorCustom(400, "메인 기념일 조회 실패");
    }
  };
}

module.exports = MainService;
