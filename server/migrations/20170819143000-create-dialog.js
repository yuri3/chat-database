module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('Dialogs', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      creator: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isPrivate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      image: Sequelize.STRING,
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    }),
  down: queryInterface/* , Sequelize */ =>
    queryInterface.dropTable('Dialogs'),
};
