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

app.use(
  morgan(function (tokens, req, res) {
    const koreanTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
    return [koreanTime, tokens.method(req, res), tokens.url(req, res), tokens.status(req, res), tokens.res(req, res, "content-length"), "-", tokens["response-time"](req, res), "ms"].join(" ");
  })
);

const domains = ["http://localhost:3000", "https://jeonhada-xoqca.run.goorm.site"];
const corsOptions = {
  origin: "*",
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
