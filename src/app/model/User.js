const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const imgUrl = "https://meovatcuocsong.vn/wp-content/uploads/2019/03/avatar-facebook-dep-2.jpg";

const Schema = mongoose.Schema;

const User = new Schema({
  userName: { type: "string", index: true },
  password: { type: "string", require: true },
  googleId: { type: "string", index: true },
  facebookId: { type: "string", index: true },
  facebookLink: { type: "string", default: "" },
  email: { type: "string", default: "" },
  phone: { type: "string", default: "" },
  imgUrl: { type: "string", default: imgUrl },
  permission: { type: "string", default: "User" },
  provider: { type: "string", default: "local" },
});

User.methods.encryptPassword = function (password) {
  return bcrypt.hashSync(password, 10);
};

User.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

User.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });
};

User.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1h" });
};

module.exports = mongoose.model("User", User);
