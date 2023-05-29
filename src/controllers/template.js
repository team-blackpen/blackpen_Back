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
}

module.exports = TemplateController;
