const User = require("../model/User");
class LoginController {
  // GET /login
  show(req, res, next) {
    let error = req.flash("error");
    if (error.length > 0) {
      return res.json({ error: error[0] });
    }
    return res.render("partials/login");
  }

  // GET /create-username
  showCreateUsername(req, res, next) {
    const user = req.user;
    const idUser = user._id;
    const userName = user.userName;
    if (!userName) return res.render("partials/create-username", { idUser });
    return next();
  }

  // POST /create-username
  createUsername(req, res, next) {
    try {
      const idUser = req.body.id;
      const userName = req.body.userName;
      const userQueryById = User.findOne({ _id: idUser });
      const userQueryByUsername = User.findOne({ userName: userName });
      Promise.all([userQueryById, userQueryByUsername])
        .then(([newUser, user]) => {
          if (user) throw new Error("Username is already in use!");
          newUser.userName = userName;
          newUser.save((err) => {
            if (err) throw new Error("Can not create your user name now!");
            req.user = newUser;
            return next();
          });
        })
        .catch((error) => {
          res.json({ error: error.message });
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new LoginController();
