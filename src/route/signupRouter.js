const express = require("express");
const signupController = require("../app/controllers/SignupController");
const passport = require("passport");
const router = express.Router();

router.get("/", signupController.show);
router.post(
  "/",
  signupController.signup,
  passport.authenticate("local_signup", {
    successRedirect: "/login",
    failureRedirect: "/signup",
    failureFlash: true,
  })
);

module.exports = router;
