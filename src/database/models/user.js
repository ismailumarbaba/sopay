// 'use strict';
// const passwordHash = require('password-hash');
const MSG = require('../../helpers/messages');

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('User', {
    psid: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    userToken: {
      type: DataTypes.STRING,
      unique: true
    },
    acc_number: {
      type: DataTypes.STRING(100), // eslint-disable-line
      unique: true
    },
    acct_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    temp_phone: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    bank: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    balance: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    chat_balance: {
      type: DataTypes.DOUBLE,
      defaultValue: 20
    },
    tx_ref: {
      type: DataTypes.STRING,
      unique: true
    }
  });
  return Users;
};
