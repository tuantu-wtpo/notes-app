const noteRouter = require("./noteRouter");
const siteRouter = require("./siteRouter");
const loginRouter = require("./loginRouter");
const signupRouter = require("./signupRouter");
const userRouter = require("./userRouter");
const linkRouter = require("./linkRouter");
const forgotPasswordRouter = require("./forgotPasswordRouter");
const { checkAccessToken, checkRefreshToken, refreshToken, generateToken } = require("../util/jwt");

function route(app) {
  app.use("/notes", checkAccessToken, noteRouter);
  app.use("/user", checkAccessToken, userRouter);
  app.use("/login", checkRefreshToken, loginRouter);
  app.use("/signup", signupRouter);
  app.use("/refresh-token", refreshToken, generateToken);
  app.use("/forgot-password", forgotPasswordRouter);
  app.use("/link", linkRouter);
  app.use("/logout", (req, res, next) => {
    req.logout(() => {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      res.redirect("/");
    });
  });
  app.use("/", siteRouter);
}

module.exports = route;
