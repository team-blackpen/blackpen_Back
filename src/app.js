require("dotenv").config();
const express = require("express");
const Router = require("./routes/index.js");
const app = express();
const port = process.env.PORT;

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
