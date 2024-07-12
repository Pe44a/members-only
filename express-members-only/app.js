require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bcrypt = require("bcryptjs")

var indexRouter = require('./routes/index');
const compression = require("compression");
const helmet = require("helmet");

const User = require("./models/user");

var app = express();

// LocalStorage and serialization
passport.use(
  new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username: username });
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        };
      const match = await bcrypt.compare(password, user.password);
        if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" })
      }
        return done(null, user);
      }catch(err) {
        return done(err);
      };
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  };
});

// Set up rate limiter: maximum of twenty requests per minute

const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  }),
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDb = process.env.MONGODB_URI;
if (!mongoDb) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

module.exports = app;
