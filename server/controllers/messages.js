const { Message } = require('../models');

const { successResponse, failureResponse } = require('../utils');

module.exports = {
  create({
    status, text, dialogId, userId,
  }) {
    return Message.create({
      status,
      text,
      dialogId,
      userId,
    }).then(message => message.get({ plain: true }))
      .catch((error) => { throw error; });
  },

  list(req, res) {
    Message.findAll({
      where: {
        dialogId: req.params.dialogId,
      },
      order: [
        ['createdAt'],
      ],
    }).then(messages => successResponse(res, messages))
      .catch(error => failureResponse(res, error));
  },

  update(req, res) {
    Message.findById(req.body.id).then((message) => {
      if (!message) {
        failureResponse(res, { message: 'Message Not Found' }, 404);
      }

      message.update(req.body, { fields: Object.keys(req.body) })
        .then(() => successResponse(res, message))
        .catch(error => failureResponse(res, error));
    })
      .catch(error => failureResponse(res, error));
  },

  destroy(req, res) {
    Message.findById(req.body.id).then((message) => {
      if (!message) {
        failureResponse(res, { message: 'Message Not Found' }, 404);
      }

      message.destroy()
        .then(() => successResponse(res, {
          id: req.body.id,
          message: 'Message deleted successfully.',
        }))
        .catch(error => failureResponse(res, error));
    })
      .catch(error => failureResponse(res, error));
  },
};
