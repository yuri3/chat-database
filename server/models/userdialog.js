module.exports = (sequelize, DataTypes) =>
  sequelize.define('UserDialog', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dialogId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
