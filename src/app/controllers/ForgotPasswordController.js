const User = require("../model/User");
const { client } = require("../../config/redis");
const { sendEmail } = require("../../config/nodeMailer");
const { v4: uuidv4 } = require("uuid");
const base64 = require("base-64");

class ForgotPasswordController {
  // GET /login
  show(req, res, next) {
    const userName = req.query.u;
    const token = req.query.t;
    res.render("partials/forgot-password", { userName, token });
  }

  async checkUsername(req, res, next) {
    try {
      const userName = req.body.userName;
      User.findOne({ userName: userName })
        .then(async (user) => {
          if (!user) throw new Error("Not user found!");
          const email = user.email;
          let code;
          do {
            code = Math.floor(Math.random() * 100000);
          } while (code < 10000);
          await sendEmail(email, code, userName);
          return res.json({
            success: `Verification code is sent to ${email}`,
            email: base64.encode(email),
          });
        })
        .catch((error) => {
          res.json({ error: error.message });
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async showVerifyCode(req, res, next) {
    try {
      const userName = req.query.u;
      const email = base64.decode(req.query.e);
      const expired = await client.ttl(`${userName}MAIL`);

      res.render("partials/verify-code", { email, expired, userName });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async verifyCode(req, res, next) {
    try {
      const userName = req.body.userName;
      const code = req.body.code;
      const checkCode = await client.HGET(`${userName}MAIL`, "verifyCode");
      if (checkCode) {
        if (checkCode === code) {
          const token = uuidv4();
          await client.HSET(userName, "token", token);
          await client.EXPIRE(userName, 5 * 60);
          return res.json({
            success: "Successful authentication!",
            token,
          });
        }
        throw new Error("Invalid verification code!");
      }
      throw new Error("Verification code is expired!");
    } catch (error) {
      res.json({ error: error.message });
    }
  }

  async changePassword(req, res, next) {
    try {
      const userName = req.body.userName;
      const newPass = req.body.newPass;
      const token = req.body.token;
      const checkToken = await client.HGET(userName, "token");

      if (checkToken) {
        if (token === checkToken) {
          User.findOne({ userName: userName })
            .then(async (user) => {
              if (!user) throw new Error("Have problem with NOTES APP!");
              user.password = await user.encryptPassword(newPass);
              user.save((error) => {
                if (error) throw new Error(error.message);
                return res.json({ success: "Update password successfully!" });
              });
            })
            .catch((error) => {
              return res.json({ error: error.message });
            });
        } else throw new Error("Ivalid access!");
      } else throw new Error("Ivalid access!");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ForgotPasswordController();
