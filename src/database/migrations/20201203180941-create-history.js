// require('dotenv').config();
// 'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Histories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product: {
        type: Sequelize.STRING,
        notEmpty: true,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
      },
      psid: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.STRING,
        allowNull: true
      },
      profit: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 0
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
  down: async (queryInterface/* , Sequelize */) => {
    await queryInterface.dropTable('Histories');
  }
};
