require("dotenv").config();
const jwt = require("jsonwebtoken");
const ErrorCustom = require("../middlewares/errorCustom");
const UserRepository = require("../repositories/user");
const userRepository = new UserRepository();

// 로그인 유무를 확인(로그인을 필수로 사용하는 api 사용, 비로그인시 에러 발생)
const isLogin = async (req, res, next) => {
  try {
    const accessToken = req.headers.accesstoken;

    if (!accessToken) {
      throw new ErrorCustom(401, "다시 로그인 해주세요.");
    }

    if (accessToken) {
      const accessAuthType = accessToken.split(" ")[0];
      const accessAuthToken = accessToken.split(" ")[1];

      if (accessAuthType !== "Bearer") {
        throw new ErrorCustom(401, "토큰 타입이 맞지 않습니다.");
      }

      let accessVerified = null;

      try {
        accessVerified = jwt.verify(accessAuthToken, process.env.JWT_KEY);
      } catch (error) {
        throw new ErrorCustom(401, "토큰이 유효하지 않습니다.");
      }

      if (accessAuthToken === "null" || accessAuthToken === "undefined" || !accessAuthToken) {
        throw new ErrorCustom(401, "로그인 후 사용해주세요.");
      }

      try {
        if (accessVerified) {
          const userNo = accessVerified.user_no;
          const user = await userRepository.isUser(userNo);

          if (user == undefined) {
            throw new ErrorCustom(401, "존재하지 않은 유저입니다.");
          }

          res.locals.user = user;

          next();
        } else {
          next();
        }
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};

// 단순히 로그인 비로그인을 확인하는 미들웨어(비로그인시 locals에 유저정보 담지 않고 그냥 next로 넘어감)
const loginCheck = async (req, res, next) => {
  try {
    const accessToken = req.headers.accesstoken;

    if (accessToken) {
      const accessAuthType = accessToken.split(" ")[0];
      const accessAuthToken = accessToken.split(" ")[1];

      if (accessAuthType !== "Bearer") {
        throw new ErrorCustom(401, "토큰 타입이 맞지 않습니다.");
      }

      let accessVerified = null;

      try {
        accessVerified = jwt.verify(accessAuthToken, process.env.JWT_KEY);
      } catch (error) {
        throw new ErrorCustom(401, "토큰이 유효하지 않습니다.");
      }

      try {
        if (accessVerified) {
          const userNo = accessVerified.user_no;
          const user = await userRepository.isUser(userNo);

          if (user == undefined) {
            throw new ErrorCustom(401, "존재하지 않은 유저입니다.");
          }

          res.locals.user = user;

          next();
        } else {
          next();
        }
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { isLogin, loginCheck };
