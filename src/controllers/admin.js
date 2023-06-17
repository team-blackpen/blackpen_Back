const AdminService = require("../services/admin");

class AdminController {
  adminService = new AdminService();

  creatArtist = async (req, res, next) => {
    try {
      const atristName = req.body.artist_name;

      if (atristName) {
        const creatArtist = await this.adminService.creatArtist(atristName);

        const data = {};
        return res.status(200).json({ result: 0, msg: "작가 등록", data });
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
        const creatPost = await this.adminService.creatPost(postData);

        const data = {};
        return res.status(200).json({ result: 0, msg: "편지지 템플릿 등록", data });
      }
      return res.status(400).json({ result: 1, errMsg: "편지지 템플릿 등록 실패" });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = AdminController;
