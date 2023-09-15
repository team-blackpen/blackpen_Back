const LetterService = require("../services/letter");
const ErrorCustom = require("../middlewares/errorCustom");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

class LetterController {
  letterService = new LetterService();

  creatLetter = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      const letter = req.body;

      const requestBody = JSON.stringify(req.body);
      console.log(`creatLetter -  userNo: ${userNo} / Request Body: ${requestBody}`);

      if (letter.status == 1 && letter.letterImg.length < 1) throw new ErrorCustom(400, "편지 이미지가 없습니다");

      const now = dayjs();
      if (letter.status == 1 && letter.info.reservationStatus == 1) {
        const subtractedTime = dayjs(letter.info.reservationDt).subtract(15, "minute");

        console.log("now : ", now.format("YYYY-MM-DD HH:mm:ss"));
        console.log("subtractedTime : ", subtractedTime.format("YYYY-MM-DD HH:mm:ss"));
        if (subtractedTime.isBefore(now)) {
          throw new ErrorCustom(400, "예약 발송은 현재 시간보다 15분 뒤부터 가능합니다.");
        }
      }

      const letterNo = await this.letterService.creatLetter(userNo, letter);

      res.status(200).json({ result: 0, msg: "편지 작성 성공", data: { letterNo: letterNo } });
    } catch (err) {
      next(err);
    }
  };

  // 편지보관함 조회
  getLetterList = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const reUserNo = user.user_no; // 받는사람 정보

      const letterList = await this.letterService.getLetterList(reUserNo);

      res.status(200).json({ result: 0, msg: "편지 보관함 조회 성공", data: { letterList } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 임시편지보관함 조회
  getLetterTmpList = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;

      const letterTmpList = await this.letterService.getLetterTmpList(userNo);

      res.status(200).json({ result: 0, msg: "임시 편지 보관함 조회 성공", data: { letterTmpList } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 편지 리스트 삭제
  deleteLetter = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      const letterList = req.body.letterList;

      const requestBody = JSON.stringify(req.body);
      console.log(`deleteLetter -  userNo: ${userNo} / Request Body: ${requestBody}`);

      const deleteLetter = await this.letterService.deleteLetter(userNo, letterList);

      res.status(200).json({ result: 0, msg: "편지 삭제 성공", data: { deleteLetter } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 임시 편지 리스트 삭제
  deleteLetterTmp = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      const letterList = req.body.letterList;
      const tmp = true;

      const requestBody = JSON.stringify(req.body);
      console.log(`deleteLetterTmp -  userNo: ${userNo} / Request Body: ${requestBody}`);

      const deleteLetter = await this.letterService.deleteLetter(userNo, letterList, tmp);

      res.status(200).json({ result: 0, msg: "임시 편지 삭제 성공", data: { deleteLetter } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 유저 편지 조회
  getLetter = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      let letterNo = req.query.letter_no;

      const letter = await this.letterService.getLetter(userNo, letterNo);

      res.status(200).json({ result: 0, msg: "편지 조회 성공", data: { letter } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 게스트 편지 조회
  getLetterHash = async (req, res, next) => {
    try {
      const userNo = 0;
      const letterNo = 0;
      const hashLetter = req.params.hash_letter;

      const letter = await this.letterService.getLetter(userNo, letterNo, hashLetter);

      res.status(200).json({ result: 0, msg: "게스트 편지 조회 성공", data: { letter } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 감동 메세지 보내기
  postThankMsg = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      const { letterNo } = req.body;
      const { thankMsg } = req.body;

      const requestBody = JSON.stringify(req.body);
      console.log(`postThankMsg -  userNo: ${userNo} / Request Body: ${requestBody}`);

      await this.letterService.postThankMsg(userNo, letterNo, thankMsg);

      res.status(200).json({ result: 0, msg: "감동 메세지 보내기 성공" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 임시저장 편지 불러오기
  getLetterTmp = async (req, res, next) => {
    try {
      const user = res.locals.user;
      const userNo = user.user_no;
      const letterNo = req.params.letter_no;

      const letterTmp = await this.letterService.getLetterTmp(userNo, letterNo);

      res.status(200).json({ result: 0, msg: "임시저장 편지 조회 성공", data: { letterTmp } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  // 폰트 조회
  getFont = async (req, res, next) => {
    try {
      let offset = req.query.page - 1;
      const limit = 5;
      offset = offset * limit;

      const fontData = await this.letterService.getFont(limit, offset);

      res.status(200).json({ result: 0, msg: "폰트 조회 성공", data: fontData.font, nextData: fontData.nextData });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
}

module.exports = LetterController;
