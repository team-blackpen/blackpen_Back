const ErrorCustom = require("./errorCustom");

module.exports = (err, req, res, next) => {
  console.log(err);

  if (err instanceof ErrorCustom) {
	  console.log("🚀 ~ file: errorHandler.js:8 ~ err.code:", err.code)
    return res.status(err.code).json({ result: 1, errMsg: err.message });
  }

  return res.status(500).json({ result: 1, errMsg: "서버 에러" });
};
