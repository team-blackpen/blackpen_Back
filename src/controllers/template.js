const TemplateService = require("../services/template");

class TemplateController {
  templateService = new TemplateService();

  getAllTemplate = async (req, res, next) => {
    try {
      const userNo = 1; //undefined;
      const { page } = req.query;

      const allTemplate = await this.templateService.getAllTemplate(userNo, page);

      res.status(200).json({ result: 0, msg: "편지 전체 조회", data: allTemplate });
    } catch {}
  };

  getAllTemplByCate = async (req, res, next) => {
    try {
      const userNo = 1; //undefined;
      const categoryNo = req.params;
      const { page } = req.query;

      const getAllTemplByCate = await this.templateService.getAllTemplByCate(userNo, categoryNo, page);

      res.status(200).json({ result: 0, msg: "편지 카테고리 조회", data: getAllTemplByCate });
    } catch {}
  };
}

module.exports = TemplateController;
