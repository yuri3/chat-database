const jwt = require('jsonwebtoken');

const successResponse = (res, payload) => {
  res.send(payload);
};

const failureResponse = (res, error, status = 404) => {
  res.status(status).send(error);
};

const EXPIRES_IN = 900;

const generateToken = (user) => {
  // Don't use password and other sensitive fields.
  const {
    email,
    password,
    phone,
    verifyEmailToken,
    verifyEmailTokenExpires,
    ...restUserData
  } = user;

  return {
    token: jwt.sign(restUserData, process.env.JWT_SECRET, {
      expiresIn: EXPIRES_IN,
    }),
    expiresIn: EXPIRES_IN,
  };
};

const getCleanUser = (user) => {
  if (!user) return {};
  const {
    password,
    verifyEmailToken,
    verifyEmailTokenExpires,
    ...restUserData
  } = user;
  return restUserData;
};

module.exports = {
  successResponse,
  failureResponse,
  generateToken,
  getCleanUser,
};
