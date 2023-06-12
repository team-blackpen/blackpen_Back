require("dotenv").config();
const express = require("express");
const Router = require("./routes/index.js");
const app = express();
const port = process.env.PORT;
const cors = require("cors");

const domains = ["http://localhost:3000", "https://jeonhada-xoqca.run.goorm.site"];

const corsOptions = {
  origin: "*",
  credentials: true, // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
};

app.use(cors(corsOptions));

const passport = require("passport");
const passportConfig = require("./passport");

passportConfig();
app.use(passport.initialize());
// app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/", Router);

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
