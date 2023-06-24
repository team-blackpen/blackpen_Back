const ErrorCustom = require("../middlewares/errorCustom");
const dayjs = require("dayjs");

const AdminRepository = require("../repositories/admin");

class AdminService {
  adminRepository = new AdminRepository();

  creatArtist = async (atristName) => {
    const findArtist = await this.adminRepository.findArtist(atristName);

    if (findArtist.length == 0) {
      const creatArtist = await this.adminRepository.creatArtist(atristName);

      return;
    } else throw new ErrorCustom(400, "이미 작가가 존재합니다.");
  };

  creatPost = async (postData) => {
    postData.regDt = dayjs().format("YYYY-MM-DD hh:mm:ss");
    console.log("🚀 ~ file: admin.js:21 ~ AdminService ~ creatPost= ~ postData:", postData);

    await this.adminRepository.insPost(postData);

    // const creatPost = await this.adminRepository.creatPost(postData);
    // const postNo = creatPost.insertId;

    // await this.adminRepository.creatArtistRel(postData, postNo);
    // await this.adminRepository.creatCateRel(postData, postNo);

    // if (postData.hashtag.length > 0) {
    //   for (let i in postData.hashtag) {
    //     await this.adminRepository.creatEtc(postNo, "hashtag", postData.hashtag[i].hashtag_title, postData.regDt);
    //   }
    // }

    // if (postData.post_img.length > 0) {
    //   for (let i in postData.post_img) {
    //     await this.adminRepository.creatEtc(postNo, "postImg", postData.post_img[i].img_url, postData.regDt);
    //   }
    // }

    // if (postData.post_detail_img.length > 0) {
    //   for (let i in postData.post_detail_img) {
    //     await this.adminRepository.creatEtc(postNo, "postDetailImg", postData.post_detail_img[i].img_url, postData.regDt);
    //   }
    // }
    return;
  };
}

module.exports = AdminService;
