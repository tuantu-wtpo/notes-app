const express = require("express");
const loginController = require("../app/controllers/LoginController");
const { handleLoginSocial } = require("../util/helper");
const passport = require("passport");
const { generateToken } = require("../util/jwt");
const router = express.Router();

router.get("/google", passport.authenticate("google_login", { scope: ["profile", "email"] }));
router.get(
  "/callback/google",
  (req, res, next) => {
    handleLoginSocial(req, res, next, "google_login");
  },
  loginController.showCreateUsername,
  generateToken
);
router.get("/facebook", passport.authenticate("facebook_login"));
router.get(
  "/callback/facebook",
  (req, res, next) => {
    handleLoginSocial(req, res, next, "facebook_login");
  },
  loginController.showCreateUsername,
  generateToken
);
router.post("/create-username", loginController.createUsername, generateToken);
router.get("/", loginController.show);
router.post(
  "/",
  loginController.login,
  passport.authenticate("local_login", { failureRedirect: "/login" }),
  generateToken
);

module.exports = router;
