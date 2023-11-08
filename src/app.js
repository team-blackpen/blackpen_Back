require("dotenv").config();
const express = require("express");
const Router = require("./routes/index.js");
const app = express();
const port = process.env.PORT;
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const morgan = require("morgan");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");
const koreanTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

app.use(
  morgan(function (tokens, req, res) {
    // URL이 "/"인 경우 로그를 출력하지 않음
    if (tokens.url(req, res) !== "/") {
      return [koreanTime, tokens.method(req, res), tokens.url(req, res), tokens.status(req, res), tokens.res(req, res, "content-length"), "-", tokens["response-time"](req, res), "ms"].join(" ");
    }
  })
);

const domains = process.env.DOMAIN;
const corsOptions = {
  origin: function (origin, callback) {
    if (domains.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("cors origin : ", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
};
app.use(cors(corsOptions));

// JSON 파싱 미들웨어
app.use(express.json());

const passport = require("passport");
const passportConfig = require("./passport");
passportConfig();
app.use(passport.initialize());
// app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/", Router);
app.use(errorHandler);

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
