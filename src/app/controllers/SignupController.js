class SignupController {
  // GET /signup
  show(req, res, next) {
    let errors = req.flash();
    let key = Object.keys(errors)[0];
    if (key) {
      const message = errors[key][0];
      return res.json({ error: message });
    }
    return res.render("partials/signup");
  }
}

module.exports = new SignupController();
