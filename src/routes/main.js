const express = require("express");
const router = express.Router();

const MainController = require("../controllers/main");
const mainController = new MainController();

router.get("/banner", mainController.getBanner);
router.get("/category", mainController.getCategory);

module.exports = router;
