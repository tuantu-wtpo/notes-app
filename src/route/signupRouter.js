const express = require("express");
const signupController = require("../app/controllers/SignupController");
const passport = require("passport");
const router = express.Router();

router.get("/", signupController.show);
router.post("/", passport.authenticate("local_signup", { failureRedirect: "signup" }), (req, res) => {
  return res.json({ success: "Create account success!", url: "/login" });
});

module.exports = router;
