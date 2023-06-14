const express = require("express");
const router = express.Router();

const AdminController = require("../controllers/admin");
const adminController = new AdminController();

router.post("/artist", adminController.creatArtist);

module.exports = router;
