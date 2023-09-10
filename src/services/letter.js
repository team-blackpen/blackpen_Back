require("dotenv").config();
const LetterRepository = require("../repositories/letter");
const AligoRepository = require("../repositories/aligo");
const PostRepository = require("../repositories/post");
const ErrorCustom = require("../middlewares/errorCustom");
const aligoapi = require("aligoapi");
const dayjs = require("dayjs");
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
  postRepository = new PostRepository();

  creatLetter = async (userNo, letter) => {
    try {
      const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

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
          // if (creatTmpLetter.errno) throw new ErrorCustom(500, "디비 에러");

          letterNo = creatTmpLetter;
        } else {
          // 임시저장이면서 편지 번호가 있음
          const udtTmpLetter = await this.letterRepository.uptLetter(letterNo, userNo, postNo, status, stage, contents, fontNo, info, img, now); // 임시편지 있으면 내용 수정 이미지는 있으면 수정

          // if (udtTmpLetter.errno) throw new ErrorCustom(500, "디비 에러");
          // if (udtTmpLetter[0].affectedRows == 0) throw new ErrorCustom(400, "편지 정보를 다시 확인해주세요."); // 수정필요
        }
      } else if (status == 1) {
        // 편지 작성완료
        let aligoStatus = 0;
        let tmpURL = process.env.tmpURL;
        if (letterNo == 0) {
          // 작성완료이면서 편지번호 없음
          const creatLetter = await this.letterRepository.insLetter(userNo, postNo, status, stage, contents, fontNo, info, img, now); // 임시편지 없으면 바로 편지발송 준비
          // if (creatLetter.errno) throw new ErrorCustom(500, "디비 에러");

          letterNo = creatLetter;
          aligoStatus = 1;
        } else {
          // 작성완료이면서 편지번호 있음
          const udtTmpLetter = await this.letterRepository.uptLetter(letterNo, userNo, postNo, status, stage, contents, fontNo, info, img, now); // 임시편지 있으면 완료로 바꾸고 편지 발송 준비

          // if (udtTmpLetter.errno) throw new ErrorCustom(500, "디비 에러");
          // if (udtTmpLetter[0].affectedRows == 0) throw new ErrorCustom(400, "편지 정보를 다시 확인해주세요."); // 수정필요

          letterNo = udtTmpLetter;
          aligoStatus = 1;
        }

        // 알림톡 발송
        // aligoStatus = 0; // 알림톡 안보내기 임시
        if (aligoStatus == 1) {
          // 토큰 발급
          let objToken = {};
          objToken.headers = { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" };
          objToken.body = {
            type: "s", // 유효시간 타입 코드 // y(년), m(월), d(일), h(시), i(분), s(초)
            time: 60, // 유효시간
          };

          const resultToken = await aligoapi.token(objToken, AuthData);
          console.log("resultToken:", resultToken);
          if (resultToken.code != 0) {
            console.log("토큰발급 실패", resultToken);
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
          tmpURL = tmpURL + letterNo.hash_no;
          template.template_msg = template.template_msg.replace(/#{URL링크}/g, tmpURL);

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
          console.log("aligoResult:", aligoResult);

          // 발송 실패 시
          if (aligoResult.code != 0) {
            console.log("발송실패 ", resultToken);
            const rollBackLetter = await this.letterRepository.rollBackLetter(letterNo, now); // 알림톡 실패 시 임시저장으로 다시변경
            throw new ErrorCustom(400, "알림톡 발송에 실패했습니다.");
          }
        }

        // 마음온도 올리기
        await this.letterRepository.plusHeart(userNo, 1);

        // 발송한 편지 유저 조회해서 종속
        await this.letterRepository.dependentLetter(info.recipientPhone, letterNo.letter_no);
      }

      return letterNo;
    } catch (err) {
      throw err;
    }
  };

  getLetterList = async (reUserNo) => {
    try {
      let letterList = await this.letterRepository.getLetterList(reUserNo);

      let newLetterList = await this.letterRepository.getNewLetterList(reUserNo);
      newLetterList = newLetterList.map((item) => item.letter_no);

      // 읽지 않은 편지라면 new_letter = 1
      letterList.forEach((letter) => {
        newLetterList.includes(letter.letter_no) ? (letter.new_letter = 1) : (letter.new_letter = 0);
      });

      return letterList;
    } catch (err) {
      throw new ErrorCustom(400, "편지 보관함 조회 실패");
    }
  };

  getLetterTmpList = async (userNo) => {
    try {
      const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD HH:mm:ss");

      const letterTmpList = await this.letterRepository.getLetterTmpList(userNo, yesterday);
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
      const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

      const getLetter = await this.letterRepository.getLetter(userNo, letterNo, hashLetter, now);

      if (!getLetter) {
        throw new ErrorCustom(400, "조회 할 편지가 없습니다");
      }

      const postPreviewImg = await this.postRepository.postEtc(getLetter.post_no, "postPreviewImg");
      getLetter.post_preview_img = postPreviewImg;

      return getLetter;
    } catch (err) {
      throw err;
    }
  };

  postThankMsg = async (userNo, letterNo, thankMsg) => {
    try {
      const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

      let letterCheck = await this.letterRepository.letterCheck(userNo, letterNo);

      if (!letterCheck) {
        throw new ErrorCustom(400, "자신의 편지에만 감동메세지를 보낼 수 있습니다.");
      }

      await this.letterRepository.postThankMsg(userNo, letterNo, thankMsg, now);
      await this.letterRepository.plusHeart(userNo, 0.5); // 마음온도 올리기
      await this.letterRepository.plusHeart(letterCheck.sendUser, 0.5); // 보낸사람 마음온도 올리기

      return;
    } catch (err) {
      throw err;
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

  getFont = async (limit, offset) => {
    try {
      const getFont = await this.letterRepository.getFont(limit, offset);
      return getFont;
    } catch (err) {
      throw new ErrorCustom(400, "폰트 조회 실패");
    }
  };
}

module.exports = LetterService;
