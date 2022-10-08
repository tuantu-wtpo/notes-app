const express = require("express");
const forgotPasswordController = require("../app/controllers/ForgotPasswordController");
const router = express.Router();

router.get("/", forgotPasswordController.show);
router
  .route("/email/verify-code")
  .get(forgotPasswordController.showVerifyCode)
  .post(forgotPasswordController.verifyCode);
router.post("/change-password", forgotPasswordController.changePassword);
router.use("/email", forgotPasswordController.checkUsername);

module.exports = router;
