var express = require('express');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
require('dotenv').config();

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

//had to lean on AI for this since I wasn't sure how to do the sessions part of the project, 
//here we set up the session middleware to manage user sessions. The secret is used to sign the session ID cookie, and the cookie's maxAge is set to 1 hour (1000 milliseconds * 60 seconds * 60 minutes).
app.use(session({
  secret: 'temporary-development-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60
  }
}));

app.use('/', authRouter);
app.use('/', indexRouter);

app.use(function(req, res, next) {
    next(createError(404));
});

module.exports = app;
