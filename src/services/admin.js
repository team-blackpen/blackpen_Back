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

  creatArtist = async (atristName, atristDescription, userNo) => {
    try {
      const findArtist = await this.adminRepository.findArtist(atristName);
      const findArtistUser = await this.adminRepository.findArtistUser(userNo);

      if (findArtist.length > 0) throw new ErrorCustom(400, "이미 등록된 작가입니다.");
      if (findArtistUser.length > 0) throw new ErrorCustom(400, "작가는 1번만 등록 가능합니다.");

      const artistNo = await this.adminRepository.creatArtist(atristName, atristDescription, userNo);

      return artistNo;
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
