const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const { User, Dialog } = require('../models');

if (!process.env.JWT_SECRET) {
  console.error('ERROR!: Please set JWT_SECRET before running the app.');
  process.exit();
}

const {
  successResponse,
  failureResponse,
  generateToken,
  getCleanUser,
} = require('../utils');
// const { sendWelcomeEmail } = require('../utils/email');

const isUserUnique = (reqBody, cb) => {
  const phone = reqBody.phone ? reqBody.phone.trim() : '';
  const login = reqBody.login ? reqBody.login.trim() : '';
  const email = reqBody.email ? reqBody.email.trim() : '';

  User.findOne({
    where: {
      $or: [
        {
          phone,
        },
        {
          login,
        },
        {
          email,
        },
      ],
    },
  })
    .then((user) => {
      if (!user) {
        cb();
        return;
      }

      const foundUser = user.get({ plain: true });

      const errors = {};
      if (foundUser.phone === phone) {
        errors.phone = `The "${phone}" is not unique!`;
      }
      if (foundUser.login === login) {
        errors.login = `The "${login}" is not unique!`;
      }
      if (foundUser.email === email) {
        errors.email = `The "${email}" is not unique!`;
      }

      cb(errors);
    })
    .catch(err => cb(err));
};

module.exports = {
  signUp(req, res) {
    const { password } = req.body;
    if (!password) {
      return failureResponse(res, {
        error: true,
        message: 'Password is empty!',
      });
    }
    if (password && password.length < 6) {
      return failureResponse(res, {
        error: true,
        message: 'Password must contain at least six characters in length!',
      });
    }
    /* eslint-disable no-param-reassign */
    const body = Object.keys(req.body)
      .reduce((obj, prop) => {
        obj[prop] = req.body[prop].trim();
        return obj;
      }, {});
    return User.create({
      ...body,
      password: bcrypt.hashSync(password.trim(), bcrypt.genSaltSync(10)),
    })
      .then((user) => {
        // sendWelcomeEmail(user, req.headers.host);
        const u = user.get({ plain: true });

        const { token, expiresIn } = generateToken(u);
        const cleanUser = getCleanUser(u);

        successResponse(res, {
          user: cleanUser,
          token,
          expiresIn,
        });
      })
      .catch(err => failureResponse(res, err));
  },

  validateFields(req, res) {
    isUserUnique(req.body, (err) => {
      if (err) {
        return failureResponse(res, err, 403);
      }
      return successResponse(res, {});
    });
  },

  logIn(req, res) {
    User.findOne({
      where: {
        $or: [
          {
            email: req.body.email,
          },
          {
            login: req.body.login,
          },
        ],
      },
    }) /* eslint-disable consistent-return */
      .then((user) => {
        if (!user) {
          return failureResponse(res, {
            error: true,
            message: 'Email/Login or Password is Wrong!',
          });
        }
        if (!req.body.password) {
          return failureResponse(res, {
            error: true,
            message: 'Email/Login or Password is Wrong!',
          });
        }
        const u = user.get({ plain: true });
        bcrypt.compare(req.body.password, u.password, (err, valid) => {
          if (err) {
            throw err;
          }
          if (!valid) {
            return failureResponse(res, {
              error: true,
              message: 'Email/Login or Password is Wrong!',
            });
          }
          const { token, expiresIn } = generateToken(u);
          const cleanUser = getCleanUser(u);

          return successResponse(res, {
            user: cleanUser,
            token,
            expiresIn,
          });
        });
      })
      .catch(err => failureResponse(res, err));
  },

  getCurrentUserFromToken(req, res) {
    /* eslint-disable dot-notation */
    let token = req.headers['authorization'] || req.query.token;
    if (!token) {
      failureResponse(res, {
        message: 'Must pass token!',
      }, 401);
    }
    token = token.replace('Bearer ', '');
    // decode token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return failureResponse(res, {
          error: true,
          message: 'Please Log in.',
        }, 401);
      }
      return User.findById(user.id)
        .then((u) => {
          const foundUser = u.get({ plain: true });
          const { expiresIn } = generateToken(foundUser);
          const cleanUser = getCleanUser(foundUser);
          return successResponse(res, {
            user: cleanUser,
            token,
            expiresIn,
          });
        })
        .catch(error => failureResponse(res, error));
    });
  },

  updateUserStatus(userId, status) {
    return User.findById(userId).then((user) => {
      if (!user) {
        throw new Error('User Not Found!');
      }
      if (status === 'offline') {
        return user.update({ status, lastSeenAt: new Date() })
          .then(u => u.get({ plain: true }))
          .catch((err) => { throw err; });
      }
      if (status === 'online') {
        return user.update({ status, lastSeenAt: null })
          .then(u => u.get({ plain: true }))
          .catch((err) => { throw err; });
      }
    })
      .catch((error) => { throw error; });
  },

  updateEmail(req, res) {
    if (!req.user) {
      failureResponse(res, {
        message: 'Permission denied!',
      }, 401);
    }
    const email = req.body.email && req.body.email.trim();
    return User.findById(req.body.id).then((user) => {
      if (!user) {
        return failureResponse(res, { message: 'User Not Found!' });
      }
      return user.update({ email })
        .then((/* u */) => {
          // sendWelcomeEmail(u, req.headers.host);
          successResponse(res, { message: 'Email was updated!' });
        })
        .catch(error => failureResponse(res, error));
    })
      .catch(error => failureResponse(res, error));
  },

  updatePassword(req, res) {
    if (!req.user) {
      failureResponse(res, {
        message: 'Permission denied!',
      }, 401);
    }
    const password = req.body.password && req.body.password.trim();
    if (!password) {
      return failureResponse(res, {
        error: true,
        message: 'Password is empty!',
      });
    }
    if (password && password.length < 6) {
      return failureResponse(res, {
        error: true,
        message: 'Password must contain at least six symbols!',
      });
    }
    return User.findById(req.body.id).then((user) => {
      if (!user) {
        return failureResponse(res, { message: 'User Not Found!' });
      }
      return user.update({
        password: bcrypt.hashSync(password.trim(), bcrypt.genSaltSync(10)),
      })
        .then((/* u */) => {
          // sendWelcomeEmail(u, req.headers.host);
          successResponse(res, { message: 'Password was updated!' });
        })
        .catch(error => failureResponse(res, error));
    })
      .catch(error => failureResponse(res, error));
  },

  list(req, res) {
    User.findAll({
      order: [
        ['createdAt'],
      ],
      attributes: {
        exclude: [
          'password',
          'verifyEmailToken',
          'verifyEmailTokenExpires',
        ],
      },
      include: [{
        model: Dialog,
        as: 'dialogs',
      }],
    })
      .then(users => successResponse(res, users))
      .catch(error => failureResponse(res, error));
  },

  update(req, res) {
    User.findById(req.body.id).then((user) => {
      if (!user) {
        failureResponse(res, { message: 'User Not Found!' }, 404);
        return;
      }

      user.update(req.body, { fields: Object.keys(req.body) })
        .then(() => successResponse(res, user))
        .catch(error => failureResponse(res, error));
    })
      .catch(error => failureResponse(res, error));
  },

  destroy(req, res) {
    User.findById(req.body.id).then((user) => {
      if (!user) {
        failureResponse(res, { message: 'User Not Found!' }, 404);
        return;
      }

      user.destroy()
        .then(() => successResponse(res, {
          id: req.body.id,
          message: 'User deleted successfully.',
        }))
        .catch(error => failureResponse(res, error));
    })
      .catch(error => failureResponse(res, error));
  },
};
