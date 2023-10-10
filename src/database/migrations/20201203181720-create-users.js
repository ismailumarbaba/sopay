// 'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      psid: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: true,
        notEmpty: true
      },
      firstName: {
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING(200),
      },
      phone: {
        type: Sequelize.STRING(200),
        defaultValue: ''
      },
      balance: {
        type: Sequelize.DOUBLE,
        defaultValue: 0
      },
      chat_balance: {
        type: Sequelize.DOUBLE,
        defaultValue: 2000
      },
      temp_phone: {
        type: Sequelize.STRING(200),
        unique: true
      },
      userToken: {
        type: Sequelize.STRING(150),
        unique: true
      },
      acc_number: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      acct_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bank: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tx_ref:{
        type: Sequelize.STRING,
        allowNull: true
      },
      expected_response: {
        type: Sequelize.STRING,
        allowNull: true
      },
      response_valid_till: {
        allowNull: true,
        type: Sequelize.DATE
      },
      createdAt: {
        type: Sequelize.DATE,
        // defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: true
      },
      updatedAt: {
        type: Sequelize.DATE,
        // defaultValue: Sequel ize.literal('CURRENT_TIMESTAMP'),
        allowNull: true
      }
    });
  },
  down: async (queryInterface/* ,Sequelize */) => {
    await queryInterface.dropTable('Users');
  }
};
