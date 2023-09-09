const ErrorCustom = require("../middlewares/errorCustom");
const dayjs = require("dayjs");

const AdminRepository = require("../repositories/admin");

class AdminService {
  adminRepository = new AdminRepository();

  creatArtist = async (atristName) => {
    const findArtist = await this.adminRepository.findArtist(atristName);

    if (findArtist.length == 0) {
      await this.adminRepository.creatArtist(atristName);

      return;
    } else throw new ErrorCustom(400, "이미 작가가 존재합니다.");
  };

  creatPost = async (postData) => {
    postData.regDt = dayjs().format("YYYY-MM-DD HH:mm:ss");
    console.log("🚀 ~ file: admin.js:21 ~ AdminService ~ creatPost= ~ postData:", postData);

    await this.adminRepository.insPost(postData);

    return;
  };
}

module.exports = AdminService;
