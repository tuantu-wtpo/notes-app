require("dotenv").config();
const path = require("path");
const express = require("express");
const { engine } = require("express-handlebars");
const passport = require("passport");
const session = require("cookie-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const db = require("./config/db");
const route = require("./route");
const Helper = require("./util/helperHbs");

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to DB
db.connect();
require("./config/passport");

// Allow cors
app.use(cors());

// Middleware to handle data
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// Static routers
app.use(express.static(path.join(__dirname + "/public")));

// Template engine
app.engine(
  "hbs",
  engine({
    extname: "hbs",
    helpers: {
      isActive: Helper.isActive,
      checkInfor: Helper.checkInfor,
      showWElement: Helper.showWElement,
      linkSocial: Helper.linkSocial,
      renderForgotPassword: Helper.renderForgotPassword,
    },
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resource", "views"));

// Session
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 5 },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash error
app.use(flash());

route(app);

app.listen(PORT, () => {
  console.log(`Listen on PORT: ${PORT}`);
});
