const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  // res.header('Access-Control-Request-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  // res.header("Access-Control-Allow-Credentials", "true");
  next();
});

/* eslint-disable consistent-return, dot-notation */
app.use((req, res, next) => {
  let token = req.headers['authorization'];
  if (!token) return next();
  token = token.replace('Bearer ', '');

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Please Log in.',
      });
    }
    req.user = user;
    next();
  });
});

app.use((err, req, res, next) => {
  console.dir(err);
  res.status(err.status || 500);
  if (err.status === 500) {
    console.error(err.stack);
    res.send({
      error: 'Internal Server Error.',
    });
  } else if (err.status === 404) {
    res.render('error');
  } else {
    res.send({
      error: err.message,
    });
  }
});

require('./server/routes')(app);

module.exports = app;
