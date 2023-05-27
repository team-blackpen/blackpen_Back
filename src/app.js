require("dotenv").config();
const express = require("express");
const Router = require("./routes/index.js");
const app = express();
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/", Router);

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
