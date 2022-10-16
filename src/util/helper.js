require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const passport = require("passport");

module.exports = {
  mutilpleMongooseToObject(datas) {
    return datas.map((data) => data.toObject());
  },

  mongooseToObject(data) {
    return data.toObject();
  },

  pushIdNote(note, idUser) {
    note.owner.push(idUser);
    note.owner = Array.from(new Set(note.owner)); //Delete ID trùng, có thể dùng method filter kết hợp với indexOf
    note.save((error) => {
      if (error) throw new Error(error.message);
    });
  },

  filterIdNote(note, idUser) {
    note.owner = note.owner.filter((id) => id !== idUser);
    note.completed = note.completed.filter((id) => id !== idUser);
    note.save((error) => {
      if (error) throw new Error(error.message);
    });
  },

  handleLoginSocial(req, res, next, social) {
    passport.authenticate(social, (err, user) => {
      if (err) {
        console.log({ err });
        return res.json({ error: err.message, redirectBack: "/user" });
      }
      req.user = user;
      return next();
    })(req, res, next);
  },

  async getBg() {
    const headers = {
      authority: "kynguyenlamdep.com",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en-AU,en;q=0.9,vi;q=0.8",
      "cache-control": "max-age=0",
      cookie: process.env.GET_BG_COOKIE,
      "sec-ch-ua": '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
    };
    const config = { headers };
    const url = "https://kynguyenlamdep.com/anh-gai-xinh/";
    const res = await axios(url, config);
    const $ = cheerio.load(res.data);
    const img = [];
    const a = $(".wp-block-image a");
    a.each((i, el) => {
      if (el.attribs.href) {
        img.push(el.attribs.href);
      }
    });
    return img;
  },
};
