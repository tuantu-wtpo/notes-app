const userController = require("../app/controllers/UserController");
const express = require("express");
const router = express.Router();

router.get("/", userController.show);
router.patch("/userName", userController.updateInfor);
router.patch("/phone", userController.updateInfor);
router.patch("/email", userController.sendVerifyCode);
router.route("/email/verify-code").get(userController.showVerifyCode).post(userController.updateEmail);
router.patch("/password", userController.handlePassword);
router.post("/image-avatar", userController.changeAvatar);

module.exports = router;
