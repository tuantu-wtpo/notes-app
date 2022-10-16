require("dotenv").config();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../app/model/User");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;
passport.serializeUser((user, done) => {
  return done(null, user);
});
passport.deserializeUser((user, done) => {
  const id = user._id;
  User.findById(id).then((user) => {
    if (!user) return done(null, false);
    return done(null, user);
  });
});

// Local signup
passport.use(
  "local_signup",
  new LocalStrategy(
    {
      usernameField: "userName",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, userName, password, done) => {
      User.findOne({ userName: userName })
        .then((user) => {
          if (user) throw new Error("Username is already in use!");
          const newUser = new User();
          newUser.userName = userName;
          newUser.password = newUser.encryptPassword(password);
          newUser.save((err) => {
            if (err) throw new Error("Can not create your account!");
            return done(null, newUser);
          });
        })
        .catch((error) => {
          return done(null, false, req.flash("error", error.message));
        });
    }
  )
);

// Local login
passport.use(
  "local_login",
  new LocalStrategy(
    {
      usernameField: "userName",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, userName, password, done) => {
      User.findOne({ userName: userName })
        .then((user) => {
          if (!user) throw new Error("Not user found!");
          if (!user.password) throw new Error("Please login with your social network!");
          if (!user.comparePassword(password)) throw new Error("Incorrect password!");
          return done(null, user);
        })
        .catch((error) => {
          return done(null, false, req.flash("error", error.message));
        });
    }
  )
);

// Google oauth
passport.use(
  "google_login",
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${CALLBACK_URL}/login/callback/google`,
    },
    async function (accessToken, refreshToken, profile, done) {
      const googleId = profile.id;
      const email = profile._json.email;
      const userQueryByID = await User.findOne({ googleId });
      const userQueryByEmail = await User.findOne({ email });
      Promise.all([userQueryByID, userQueryByEmail])
        .then(([userByID, userByEmail]) => {
          if (userByID) return done(null, userByID);
          if (userByEmail) {
            userByEmail.googleId = googleId;
            userByEmail.save((err) => {
              if (err) throw new Error("Can not login with your google account!");
              return done(null, userByEmail);
            });
          } else {
            const imgUrl = profile._json.picture;
            const provider = profile.provider;
            const infor = { googleId, email, imgUrl, provider };
            const newUser = new User(infor);
            newUser.save((err) => {
              if (err) {
                console.log({ err });
                throw new Error("Can not login with your google account!");
              }
              return done(null, newUser);
            });
          }
        })
        .catch((err) => {
          console.log({ err });
          return done(err);
        });
    }
  )
);

// Facebook oauth
passport.use(
  "facebook_login",
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: `${CALLBACK_URL}/login/callback/facebook`,
      profileFields: ["id", "displayName", "photos", "email", "profileUrl"],
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      const facebookId = profile.id;
      const email = profile._json.email;
      const userQueryByID = await User.findOne({ facebookId });
      const userQueryByEmail = await User.findOne({ email });
      Promise.all([userQueryByID, userQueryByEmail])
        .then(([userByID, userByEmail]) => {
          if (userByID) return done(null, userByID);
          if (userByEmail) {
            userByEmail.facebookId = facebookId;
            userByEmail.facebookLink = profile._json.link;
            userByEmail.save((err) => {
              if (err) throw new Error("Can not login with your facebook account!");
              return done(null, userByEmail);
            });
          } else {
            const facebookLink = profile._json.link;
            const imgUrl = profile._json.picture.data.url;
            const provider = profile.provider;
            const infor = { facebookId, email, facebookLink, imgUrl, provider };
            const newUser = new User(infor);
            newUser.save((err) => {
              if (err) {
                console.log({ err });
                throw new Error("Can not login with your facebook account!");
              }
              return done(null, newUser);
            });
          }
        })
        .catch((err) => {
          console.log({ err });
          return done(err);
        });
    }
  )
);

// Facebook link account
passport.use(
  "facebook_link",
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: `${CALLBACK_URL}/link/callback/facebook`,
      profileFields: ["id", "displayName", "photos", "email", "profileUrl"],
      passReqToCallback: true,
    },
    function (req, accessToken, refreshToken, profile, done) {
      const refreshTokenInCookies = req.cookies.refreshToken;
      if (!refreshTokenInCookies) throw new Error("The session has ended!");
      jwt.verify(refreshTokenInCookies, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) throw new Error("The session has ended!");
        const idUser = payload.id;
        const facebookId = profile.id;
        const userQueryByFbId = User.findOne({ facebookId });
        const userQuery = User.findOne({ _id: idUser });
        Promise.all([userQueryByFbId, userQuery])
          .then(([userByFbID, user]) => {
            if (userByFbID) throw new Error("This facebook account is already linked by another account!");
            if (!user) throw new Error("Not found your user!");
            user.facebookId = profile.id;
            user.email = user.email || profile._json.email;
            user.facebookLink = profile._json.link;
            user.save((err) => {
              if (err) throw new Error("Can not link your facebook account!");
              return done(null, user);
            });
          })
          .catch((err) => {
            done(err);
          });
      });
    }
  )
);
