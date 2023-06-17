const express = require("express");
const router = express.Router();

const AdminController = require("../controllers/admin");
const adminController = new AdminController();

router.post("/artist", adminController.creatArtist);
router.post("/post", adminController.creatPost);

module.exports = router;
