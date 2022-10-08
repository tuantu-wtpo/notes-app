const User = require("../model/User");
const Note = require("../model/Note");
const { mongooseToObject } = require("../../util/helper");
const { cloudinary } = require("../../config/storage");
const { sendEmail } = require("../../config/nodeMailer");
const { client } = require("../../config/redis");
const base64 = require("base-64");

class UserController {
  // GET /
  show(req, res, next) {
    const idUser = req.idUser;
    const userQuery = User.findOne({ _id: idUser });
    const notesQuery = Note.count({ owner: idUser });
    const activeQuery = Note.count({ owner: idUser, completed: { $nin: idUser } });
    const completedQuery = Note.count({ owner: idUser, completed: idUser });

    Promise.all([userQuery, notesQuery, activeQuery, completedQuery])
      .then(([user, allNote, activeNote, completedNote]) => {
        res.render("partials/user", {
          user: mongooseToObject(user),
          allNote,
          activeNote,
          completedNote,
        });
      })
      .catch(next);
  }

  // PATCH /username || phone || password
  updateInfor(req, res, next) {
    try {
      const idUser = req.idUser;
      const data = req.body;
      const key = Object.keys(data)[0];
      User.findOne(data)
        .then((user) => {
          if (user) {
            const message = `${key[0].toUpperCase() + key.slice(1)} is already in use!`;
            throw new Error(message);
          }
          return User.findOne({ _id: idUser });
        })
        .then((user) => {
          const newValue = data[key];
          user[key] = newValue;
          return user.save();
        })
        .then((user) => {
          const message = `${key[0].toUpperCase() + key.slice(1)} is updated!`;
          return res.json({ success: message });
        })
        .catch((error) => {
          res.json({ error: error.message });
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // PATCH /email
  async sendVerifyCode(req, res, next) {
    try {
      const idUser = req.idUser;
      const email = req.body.email;
      User.findOne({ email: email })
        .then(async (user) => {
          if (user) throw new Error("Email is already in use!");
          let code;
          do {
            code = Math.floor(Math.random() * 100000);
          } while (code < 10000);
          await sendEmail(email, code, idUser);
          return res.json({
            success: `Verification code is sent to ${email}`,
            email: base64.encode(email),
          });
        })
        .catch((error) => {
          return res.json({ error: error.message });
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /verify-code
  async showVerifyCode(req, res, next) {
    try {
      const idUser = req.idUser;
      const email = base64.decode(req.query.e);
      const expired = await client.ttl(`${idUser}MAIL`);

      res.render("partials/verify-code", { email: email, expired: expired });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /verify-code
  async updateEmail(req, res, next) {
    try {
      const idUser = req.idUser;
      const email = req.body.email;
      const code = req.body.code;
      const checkCode = await client.HGET(`${idUser}MAIL`, "verifyCode");
      if (!checkCode) throw new Error("Verification code is expired!");
      if (checkCode !== code) throw new Error("Invalid verification code!");
      User.findById({ _id: idUser })
        .then((user) => {
          user.email = email;
          user.save((err) => {
            if (err) throw new Error("Can not save your email!");
            return res.json({ success: "Email confirmation successful!" });
          });
        })
        .catch((error) => {
          throw new Error(error.message);
        });
    } catch (error) {
      res.json({ error: error.message });
    }
  }

  // POST /image-avatar
  async changeAvatar(req, res, next) {
    try {
      const idUser = req.idUser;
      const fileString = req.body.fileString;
      await cloudinary.uploader.destroy(`avatar_notes_app/${idUser}`);
      const result = await cloudinary.uploader.upload(fileString, {
        upload_preset: "notes_app",
        public_id: idUser,
      });
      User.findById({ _id: idUser })
        .then((user) => {
          user.imgUrl = result.secure_url;
          user.save((err) => {
            if (err) throw new Error("Can not save your avatar!");
            return res.json({ success: "Update avatar successfully!" });
          });
        })
        .catch((error) => {
          res.json({ error: error.message });
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  handlePassword(req, res, next) {
    try {
      const idUser = req.idUser;
      const oldPass = req.body.oldPass;
      const newPass = req.body.newPass;
      User.findById(idUser)
        .then((user) => {
          if (user.provider !== "local") return user;
          let isPass = user.comparePassword(oldPass);
          if (isPass) {
            return user;
          } else throw new Error("Old password is incorrect!");
        })
        .then((user) => {
          user.password = user.encryptPassword(newPass);
          user.provider = "local";
          user.save((err) => {
            if (err) throw new Error("Can not save your password!");
            return res.json({ success: "Update password successfull!" });
          });
        })
        .catch((error) => {
          res.json({ error: error.message });
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
