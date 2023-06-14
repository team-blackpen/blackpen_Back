const AdminService = require("../services/admin");

class AdminController {
  adminService = new AdminService();

  creatArtist = async (req, res, next) => {
    try {
      const atristName = req.body.artist_name;

      if (atristName) {
        const creatArtist = await this.adminService.creatArtist(atristName);

        const data = { artist: creatArtist };
        return res.status(200).json({ result: 0, msg: "작가 등록", data });
      }
      return res.status(400).json({ result: 1, errMsg: "작가 등록 실패" });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = AdminController;
