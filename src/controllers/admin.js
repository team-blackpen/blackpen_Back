const AdminService = require("../services/admin");

class AdminController {
  adminService = new AdminService();

  adminCate = async (req, res, next) => {
    try {
      const allCategory = await this.adminService.adminCate();

      const data = { categoryList: allCategory };

      res.status(200).json({ result: 0, msg: "카테고리 항목 조회", data });
    } catch (err) {
      next(err);
    }
  };

  creatArtist = async (req, res, next) => {
    try {
      const atristName = req.body.artist_name;

      if (atristName) {
        await this.adminService.creatArtist(atristName);

        return res.status(200).json({ result: 0, msg: "작가 등록" });
      }
      return res.status(400).json({ result: 1, errMsg: "작가 등록 실패" });
    } catch (err) {
      next(err);
    }
  };

  creatPost = async (req, res, next) => {
    try {
      const postData = req.body;

      if (postData) {
        await this.adminService.creatPost(postData);

        return res.status(200).json({ result: 0, msg: "편지지 템플릿 등록" });
      }
      return res.status(400).json({ result: 1, errMsg: "편지지 템플릿 등록 실패" });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = AdminController;
