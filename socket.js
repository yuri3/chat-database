const {
  users: usersController,
  messages: messagesController,
} = require('./server/controllers');

module.exports = (io) => {
  const updateUserStatus = async (socket, status) => {
    const { userId } = socket.handshake.query;
    try {
      const user = await usersController.updateUserStatus(userId, status);
      socket.broadcast.emit(`user ${status}`, { id: user.id, status, lastSeenAt: user.lastSeenAt });
    } catch (err) {
      socket.emit('error', err);
    }
  };
  io.on('connection', async (socket) => {
    console.log('a user connected');

    updateUserStatus(socket, 'online');

    socket.on('disconnect', () => {
      console.log('user disconnected');
      updateUserStatus(socket, 'offline');
    });

    socket.on('join_dialog', (payload) => {
      socket.join(`room ${payload.dialogId}`, () => {
        console.log('join_dialog');
        // socket.to(`room ${payload.dialogId}`).emit('user_has_joined', payload);
      });
    });

    socket.on('user_typing', (payload) => {
      socket.to(`room ${payload.dialogId}`).emit('user_typing', payload);
    });

    /* eslint-disable consistent-return */
    socket.on('send_message', async (payload) => {
      try {
        const message = await messagesController.create({
          ...payload,
          status: 'sent',
        });
        io.to(`room ${payload.dialogId}`)
          .emit('receive_message', message);
      } catch (error) {
        io.to(`room ${payload.dialogId}`)
          .emit('receive_message_error', {
            ...payload,
            status: 'error',
            error,
          });
        return error;
      }
    });

    socket.on('leave_dialog', (payload) => {
      socket.leave(`room ${payload.dialogId}`, () => {
        console.log('leave_dialog');
        // socket.to(`room ${payload.dialogId}`).emit('user_has_left', payload);
      });
    });

    socket.on('error', (error) => {
      console.log('error', error.message);
    });
  });
};
