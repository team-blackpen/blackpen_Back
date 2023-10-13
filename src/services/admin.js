const ErrorCustom = require("../middlewares/errorCustom");
const dayjs = require("dayjs");

const AdminRepository = require("../repositories/admin");

class AdminService {
  adminRepository = new AdminRepository();

  adminCate = async () => {
    try {
      const cateList = await this.adminRepository.getAdminCate();

      return cateList;
    } catch (err) {
      if (err.code == 400) throw err;
      throw new ErrorCustom(400, "카테고리 항목 조회 실패");
    }
  };

  creatArtist = async (atristName) => {
    try {
      const findArtist = await this.adminRepository.findArtist(atristName);

      if (findArtist.length == 0) {
        await this.adminRepository.creatArtist(atristName);

        return;
      } else throw new ErrorCustom(400, "이미 작가가 존재합니다.");
    } catch (err) {
      if (err.code == 400) throw err;
      throw new ErrorCustom(400, "작가 등록 실패");
    }
  };

  creatPost = async (postData) => {
    try {
      postData.regDt = dayjs().format("YYYY-MM-DD HH:mm:ss");

      const post = await this.adminRepository.insPost(postData);

      return post;
    } catch (err) {
      if (err.code == 400) throw err;
      throw new ErrorCustom(400, "편지지 템플릿 등록 실패");
    }
  };
}

module.exports = AdminService;
