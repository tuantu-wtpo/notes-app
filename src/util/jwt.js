require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../app/model/User");
const { client } = require("../config/redis");

module.exports = {
  checkAccessToken: (req, res, next) => {
    try {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) return res.redirect(`/refresh-token?url=${req.originalUrl}`);
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
          return res.redirect(`/refresh-token?url=${req.originalUrl}`);
        }
        const idUser = payload.id;
        User.findById({ _id: idUser })
          .then((user) => {
            if (!user) {
              res.clearCookie("refreshToken");
              res.clearCookie("accessToken");
              throw new Error("User is deleted!");
            }
            req.idUser = idUser;
            return next();
          })
          .catch((error) => {
            res.json({ error: error.message, redirectBack: "/signup" });
          });
      });
    } catch (err) {
      res.json({ error: err.message, redirectBack: "/signup" });
    }
  },

  checkRefreshToken: (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) return next();
      return res.redirect("/refresh-token");
    } catch (err) {
      res.json({ error: err.message });
    }
  },

  refreshToken: (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) return res.redirect("/login");
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, payload) => {
        if (err) return res.redirect("/logout");
        const idUser = payload.id;
        const checkRefreshToken = await client.HGET(idUser, "refreshToken");
        if (checkRefreshToken !== refreshToken) return res.redirect("/logout");
        User.findById({ _id: idUser })
          .then((user) => {
            if (user) {
              req.user = user;
              return next();
            } else {
              res.clearCookie("refreshToken");
              res.clearCookie("accessToken");
              throw new Error("User is deleted!");
            }
          })
          .catch((error) => {
            res.json({ error: error.message, redirectBack: "/signup" });
          });
      });
    } catch (err) {
      res.json({ error: err.message });
    }
  },

  generateToken: async (req, res, next) => {
    try {
      const user = req.user;
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      const idUser = user._id.toString();
      await client.HSET(idUser, "refreshToken", refreshToken);
      await client.EXPIRE(idUser, 60 * 60);
      res
        .cookie("accessToken", accessToken, {
          maxAge: 5 * 60 * 1000,
        })
        .cookie("refreshToken", refreshToken, {
          maxAge: 60 * 60 * 1000,
          httpOnly: true,
          secure: true,
        });
      if (req.query.url) return res.redirect(req.query.url);
      return res.redirect("/notes");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
