const siteController = require("../app/controllers/SiteController");
const express = require("express");
const router = express.Router();

router.get("/home", siteController.home);
router.get("/background", siteController.getBackground);
router.use("/", siteController.home);

module.exports = router;
