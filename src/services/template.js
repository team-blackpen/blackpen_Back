const TemplateRepository = require("../repositories/template");

class TemplateService {
  templateRepository = new TemplateRepository();

  getAllTemplate = async (userNo, page) => {
    let startPage = 0;
    let endPage = 10;
    if (page > 1) {
      startPage = (page - 1) * 10;
      endPage = page * 10;
    }

    const allTemplate = await this.templateRepository.allTemplate(userNo, startPage, endPage);

    return allTemplate;
  };

  getAllTemplByCate = async (userNo, categoryNo, page) => {
    let startPage = 0;
    let endPage = 10;
    if (page > 1) {
      startPage = (page - 1) * 10;
      endPage = page * 10;
    }

    const allTemplate = await this.templateRepository.allTemplate(userNo, startPage, endPage, categoryNo);

    return allTemplate;

    // const allTemplByCate = await this.templateRepository.allTemplByCate(userNo, categoryNo, startPage, endPage);

    // return allTemplByCate;
  };

  getTemplateDetail = async (userNo, postNo) => {
    const template = await this.templateRepository.templateDetail(userNo, postNo);
    const templateImg = await this.templateRepository.templateImg(postNo);
    const templateDetailImg = await this.templateRepository.templateDetailImg(postNo);
    const templateHash = await this.templateRepository.templateHash(postNo);
    template.post_img = templateImg;
    template.post_detail_img = templateDetailImg;
    template.hashtag = templateHash;

    return template;
  };
}

module.exports = TemplateService;
