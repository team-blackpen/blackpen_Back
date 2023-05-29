const express = require("express");
const router = express.Router();

const TemplateController = require("../controllers/Template");
const templateController = new TemplateController();

router.get("/", templateController.getAllTemplate);

module.exports = router;
