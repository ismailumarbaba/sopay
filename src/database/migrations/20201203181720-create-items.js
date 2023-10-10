// 'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name_owner: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        notEmpty: true
      },
      item_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        notEmpty: true,
        unique: true
      },
      owner: {
        type: Sequelize.STRING(100),
        allowNull: false,
        notEmpty: true
      },
      cost: {
        type: Sequelize.STRING,
        allowNull: false,
        notEmpty: true,
        default: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface/* ,Sequelize */) => {
    await queryInterface.dropTable('Items');
  }
};
