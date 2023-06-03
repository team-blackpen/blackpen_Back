const express = require("express");
const router = express.Router();

const TemplateController = require("../controllers/template");
const templateController = new TemplateController();

router.get("/", templateController.getAllTemplate);
router.get("/category/:categoryNo", templateController.getAllTemplByCate);
router.get("/detail/:postNo", templateController.getTemplateDetail);

module.exports = router;
