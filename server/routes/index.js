require('dotenv').config();

const {
  users: usersController,
  messages: messagesController,
  dialogs: dialogsController,
} = require('../controllers');

module.exports = (app) => {
  app.post('/sign_up/validate/fields', usersController.validateFields);
  app.post('/sign_up', usersController.signUp);
  app.get('/me/from/token', usersController.getCurrentUserFromToken);
  app.post('/log_in', usersController.logIn);

  app.put('/update-email', usersController.updateEmail);
  app.put('/update-password', usersController.updatePassword);
  app.get('/users', usersController.list);
  app.put('/users', usersController.update);
  app.delete('/users', usersController.destroy);

  app.get('/messages/:dialogId', messagesController.list);
  app.put('/messages', messagesController.update);
  app.delete('/messages', messagesController.destroy);

  app.post('/dialogs', dialogsController.findOrCreateDialog);
  app.get('/dialogs/:myId', dialogsController.list);
  app.get('/dialog/:id', dialogsController.findDialogById);
  app.put('/dialogs', dialogsController.update);
  app.delete('/dialogs', dialogsController.destroy);
};
