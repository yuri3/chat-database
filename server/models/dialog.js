module.exports = (sequelize, DataTypes) => {
  const Dialog = sequelize.define('Dialog', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Dialog name is empty!',
        },
      },
    },
    creator: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Creator name is empty!',
        },
      },
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    image: DataTypes.STRING,
  });

  Dialog.associate = (models) => {
    Dialog.hasMany(models.Message, {
      foreignKey: 'dialogId',
      as: 'messages',
    });

    Dialog.belongsToMany(models.User, {
      through: 'UserDialog',
      foreignKey: 'dialogId',
      as: 'users',
    });
  };

  return Dialog;
};
