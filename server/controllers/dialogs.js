const { User, Message, Dialog } = require('../models');
const { successResponse, failureResponse } = require('../utils');

const create = (res, body) => (
  Dialog.create(body).then(dialog => (
    dialog.addUsers([body.myId, body.dialogToId])
      .then(() => successResponse(res, dialog.get({ plain: true })))
      .catch((error) => {
        failureResponse(res, error);
        dialog.destroy();
      })
  ))
    .catch(error => failureResponse(res, error))
);

module.exports = {
  findOrCreateDialog(req, res) {
    const {
      isPrivate = true,
      myId,
      dialogToId,
    } = req.body;

    Dialog.findAll({
      where: {
        isPrivate,
      },
      include: [{
        model: User,
        as: 'users',
        where: {
          id: dialogToId,
        },
        attributes: {
          exclude: [
            'password',
            'verifyEmailToken',
            'verifyEmailTokenExpires',
          ],
        },
      }],
    }).then((dialogs) => {
      if (dialogs.length === 0) {
        return create(res, req.body);
      }
      if (dialogs.length >= 1) {
        const fn = async function asyncFn(index = 0, dialog) {
          if (index > dialogs.length - 1) {
            return !dialog ? null : dialog;
          }
          const result = await dialogs[index].hasUser(myId);
          if (result) {
            return asyncFn(dialogs.length, dialogs[index]);
          }
          return asyncFn(index + 1);
        };
        fn().then((dialog) => {
          if (!dialog) {
            return create(res, req.body);
          }
          return successResponse(res, dialog);
        });
      }
      return undefined;
    });
  },

  list(req, res) {
    Dialog.findAll({
      include: [{
        model: User,
        as: 'users',
      }, {
        model: Message,
        as: 'messages',
      }],
      order: [
        ['createdAt'],
        [{ model: Message, as: 'messages' }, 'createdAt'],
      ],
    }).then((dialogs) => {
      const fn = async function asyncFn(index = 0, dls = []) {
        if (index > dialogs.length - 1) {
          return dls;
        }
        const result = await dialogs[index].hasUser(req.params.myId);
        if (result) {
          dls = [...dls, dialogs[index]];
        }
        return asyncFn(index + 1, dls);
      };
      fn().then((dls) => {
        if (!dls) {
          failureResponse(res, { message: 'Dialogs Not Found!' }, 404);
        }
        successResponse(res, dls);
      });
    })
      .catch(error => failureResponse(res, error));
  },

  findDialogById(req, res) {
    Dialog.findOne({
      where: {
        id: req.params.id,
      },
      include: [{
        model: User,
        as: 'users',
        attributes: {
          exclude: [
            'password',
            'verifyEmailToken',
            'verifyEmailTokenExpires',
          ],
        },
      }],
    }).then((dialog) => {
      if (!dialog) {
        failureResponse(res, { message: 'Dialog Not Found!' }, 404);
      }
      successResponse(res, dialog);
    })
      .catch(error => failureResponse(res, error));
  },

  update(req, res) {
    Dialog.findById(req.body.id).then((dialog) => {
      if (!dialog) {
        failureResponse(res, { message: 'Dialog Not Found!' }, 404);
      }

      dialog.update(req.body, { fields: Object.keys(req.body) })
        .then(() => successResponse(res, dialog))
        .catch(error => failureResponse(res, error));
    })
      .catch(error => failureResponse(res, error));
  },

  destroy(req, res) {
    const { id } = req.body;
    Dialog.findById(id).then((dialog) => {
      if (!dialog) {
        failureResponse(res, { message: 'Dialog Not Found' }, 404);
      }

      dialog.destroy()
        .then(() => successResponse(res, {
          id,
          message: 'Dialog deleted successfully.',
        }))
        .catch(error => failureResponse(res, error));
    })
      .catch(error => failureResponse(res, error));
  },
};
