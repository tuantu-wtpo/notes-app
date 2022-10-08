const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get("/facebook", passport.authenticate("facebook_link"));
router.get("/callback/facebook", (req, res, next) => {
  passport.authenticate("facebook_link", (err, user) => {
    if (err) return res.json({ error: err.message, redirectBack: "/user" });
    res.redirect("/user");
  })(req, res, next);
});

module.exports = router;
