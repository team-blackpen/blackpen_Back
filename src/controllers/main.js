const express = require("express");
const app = express();

const MainService = require("../services/main");

class MainController {
  mainService = new MainService();

  getBanner = async (req, res, next) => {
    try {
      const allBanner = await this.mainService.getBanner();

      const data = { banner: allBanner };

      res.status(200).json({ result: 0, msg: "광고 배너 조회", data });
    } catch {}
  };

  getCategory = async (req, res, next) => {
    try {
      const allCategory = await this.mainService.getCategory();

      const data = { category: allCategory };

      res.status(200).json({ result: 0, msg: "카테고리 조회", data });
    } catch {}
  };
}

module.exports = MainController;
