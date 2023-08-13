require("dotenv").config();
const LetterRepository = require("../repositories/letter");
const AligoRepository = require("../repositories/aligo");
const dayjs = require("dayjs");
const ErrorCustom = require("../middlewares/errorCustom");
const aligoapi = require("aligoapi");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

const AuthData = {
  apikey: process.env.ALIGOAPIKEY,
  userid: process.env.ALIGOUSERID,
  token: process.env.ALIGOTOKEN,
};

class LetterService {
  letterRepository = new LetterRepository();
  aligoRepository = new AligoRepository();

  creatLetter = async (userNo, letter) => {
    try {
      const now = dayjs().format("YYYY-MM-DD hh:mm:ss");

      let letterNo = letter.letterNo;
      const postNo = letter.postNo;
      const status = letter.status;
      const stage = letter.stage;
      const contents = letter.letterContents;
      const fontNo = letter.fontNo;
      const info = letter.info;
      const img = letter.letterImg;

      if (status == 0) {
        // 임시편지 저장?
        if (letterNo == 0) {
          // 임시저장이면서 편지 번호가 없음
          const creatTmpLetter = await this.letterRepository.insLetter(userNo, postNo, status, stage, contents, fontNo, info, img, now); // 임시편지 없으면 내용 생성 이미지는 있으면 생성
          if (creatTmpLetter.errno) throw new ErrorCustom(500, "디비 에러");
          letterNo = creatTmpLetter;
        } else {
          // 임시저장이면서 편지 번호가 있음
          const udtTmpLetter = await this.letterRepository.uptLetter(letterNo, userNo, postNo, status, stage, contents, fontNo, info, img, now); // 임시편지 있으면 내용 수정 이미지는 있으면 수정
          if (udtTmpLetter.errno) throw new ErrorCustom(500, "디비 에러");
        }
      } else {
        // 편지 작성완료
        let aligoStatus = 0;
        if (letterNo == 0) {
          // 작성완료이면서 편지번호 없음
          const creatLetter = await this.letterRepository.insLetter(userNo, postNo, status, stage, contents, fontNo, info, img, now); // 임시편지 없으면 바로 편지발송 준비
          console.log(creatLetter);
          if (creatLetter.errno) throw new ErrorCustom(500, "디비 에러");
          // 에러 나면 디비단은 로그만 남기고 에러는 서비스단에서 넘기는걸로 쿼리에러는 잡는데 디비에러는 못잡는중

          letterNo = creatLetter;
          aligoStatus = 1;
        } else {
          // 작성완료이면서 편지번호 있음
          const udtTmpLetter = await this.letterRepository.uptLetter(letterNo, userNo, postNo, status, stage, contents, fontNo, info, img, now); // 임시편지 있으면 완료로 바꾸고 편지 발송 준비
          if (udtTmpLetter.errno) throw new ErrorCustom(500, "디비 에러");
          aligoStatus = 1;
        }

        // 알림톡 발송
        // aligoStatus = 0; // 임시
        if (aligoStatus == 1) {
          // 토큰 발급
          let objToken = {};
          objToken.headers = { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" };
          objToken.body = {
            type: "s", // 유효시간 타입 코드 // y(년), m(월), d(일), h(시), i(분), s(초)
            time: 60, // 유효시간
          };

          const resultToken = await aligoapi.token(objToken, AuthData);
          console.log("🚀 ~ file: letter.js:78 ~ LetterService ~ creatLetter= ~ resultToken:", resultToken);
          if (resultToken.code != 0) {
            console.log(resultToken);
            await this.letterRepository.rollBackLetter(letterNo, now); // 알림톡 실패 시 임시저장으로 다시변경
            throw new ErrorCustom(400, "알림톡 발송에 실패했습니다.");
          }
          AuthData.token = resultToken.token;

          // 알림톡 발송 요청
          let obj = {};
          obj.headers = { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" };

          const template = await this.aligoRepository.getTemplate("전하다 테스트1");

          template.template_msg = template.template_msg.replace(/#{발신인명}/g, info.sender);
          template.template_msg = template.template_msg.replace(/#{수신인명}/g, info.recipient);
          template.template_msg = template.template_msg.replace(/#{URL링크}/g, process.env.tmpURL);

          obj.body = {
            senderkey: process.env.ALIGOSENDERKEY, // 발신프로필 키
            tpl_code: template.template_code, // 템플릿 코드
            sender: process.env.ALIGOSENDERPHONE, // 발신자 연락처
            receiver_1: info.recipientPhone, // 수신자 연락처
            recvname_1: info.recipient,
            subject_1: template.template_title, // 알림톡 제목
            message_1: template.template_msg, // 알림톡 내용
            // failover: "Y", // 실패시 대체문자 전송기능 // Y or N
            // fsubject_1: "대체테스트1", // 실패시 대체문자 제목
            // fmessage_1: "대체제발", // 실패시 대체문자 내용
          };
          // failover값이 Y일때 fsubject와 fmessage값은 필수입니다.

          // 템플릿 버튼 정보
          let buttonInfo = {
            button: [
              {
                name: template.button_name,
                linkType: template.button_link,
                linkTypeName: template.button_link_name,
                linkMo: template.button_mo,
                linkPc: template.button_pc,
              },
            ],
          };
          buttonInfo = JSON.stringify(buttonInfo);
          obj.body.button_1 = buttonInfo; // 버튼 정보 // JSON string

          // 예약 발송 설정
          if (info.reservationStatus == 1) {
            obj.body.senddate = info.reservationDt;
          }

          const aligoResult = await aligoapi.alimtalkSend(obj, AuthData);
          console.log("🚀 ~ file: letter.js:129 ~ LetterService ~ creatLetter= ~ aligoResult:", aligoResult);

          // 발송 실패 시
          if (aligoResult.code != 0) {
            console.log(resultToken);
            const rollBackLetter = await this.letterRepository.rollBackLetter(letterNo, now); // 알림톡 실패 시 임시저장으로 다시변경
            throw new ErrorCustom(400, "알림톡 발송에 실패했습니다.");
          }
        }
      }

      return letterNo;
    } catch (err) {
      throw err;
    }
  };

  getLetterList = async (reUserNo) => {
    try {
      const letterList = await this.letterRepository.getLetterList(reUserNo);
      return letterList;
    } catch (err) {
      throw new ErrorCustom(400, "편지 보관함 조회 실패");
    }
  };

  getLetterTmpList = async (userNo) => {
    try {
      const letterTmpList = await this.letterRepository.getLetterTmpList(userNo);
      return letterTmpList;
    } catch (err) {
      throw new ErrorCustom(400, "임시 편지 보관함 조회 실패");
    }
  };

  deleteLetter = async (userNo, letterList, tmp) => {
    try {
      const deleteLetter = await this.letterRepository.deleteLetter(userNo, letterList, tmp);
      return deleteLetter;
    } catch (err) {
      if (tmp) {
        throw new ErrorCustom(400, "임시 편지 삭제 실패");
      } else {
        throw new ErrorCustom(400, "편지 삭제 실패");
      }
    }
  };

  getLetter = async (userNo, letterNo, hashLetter) => {
    try {
      const now = dayjs().format("YYYY-MM-DD hh:mm:ss");
      const getLetter = await this.letterRepository.getLetter(userNo, letterNo, hashLetter, now);
      return getLetter;
    } catch (err) {
      throw new ErrorCustom(400, "편지 조회 실패");
    }
  };

  getLetterTmp = async (userNo, letterNo) => {
    try {
      const letterTmp = await this.letterRepository.getLetterTmp(userNo, letterNo);
      return letterTmp;
    } catch (err) {
      throw new ErrorCustom(400, "임시저장 편지 조회 실패");
    }
  };

  getFont = async () => {
    try {
      const getFont = await this.letterRepository.getFont();
      return getFont;
    } catch (err) {
      throw new ErrorCustom(400, "폰트 조회 실패");
    }
  };
}

module.exports = LetterService;
