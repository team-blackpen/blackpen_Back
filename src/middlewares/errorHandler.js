const ErrorCustom = require("./errorCustom");

module.exports = (err, req, res, next) => {
  if (err instanceof ErrorCustom) {
    return res.status(err.code).json({ result: 1, errMsg: err.message });
  }

  console.error(`errorHandler -  err: `, err);

  return res.status(500).json({ result: 1, errMsg: "서버 에러" });
};
