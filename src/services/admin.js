const ErrorCustom = require("../middlewares/errorCustom");
const dayjs = require("dayjs");

const AdminRepository = require("../repositories/admin");

class AdminService {
  adminRepository = new AdminRepository();

  creatArtist = async (atristName) => {
    const findArtist = await this.adminRepository.findArtist(atristName);

    if (findArtist.length == 0) {
      const creatArtist = await this.adminRepository.creatArtist(atristName);

      return creatArtist;
    } else throw new ErrorCustom(400, "이미 작가가 존재합니다.");
  };
}

module.exports = AdminService;
