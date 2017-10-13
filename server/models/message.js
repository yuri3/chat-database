module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Text is empty!',
        },
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });

    Message.belongsTo(models.Dialog, {
      foreignKey: 'dialogId',
      onDelete: 'CASCADE',
    });
  };

  return Message;
};
