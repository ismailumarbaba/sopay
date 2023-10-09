// 'use strict';
// const passwordHash = require('password-hash');
const MSG = require('../../helpers/messages');

module.exports = (sequelize, DataTypes) => {
  const Items = sequelize.define('Item', {
    name:DataTypes.STRING, 
    item_id:DataTypes.STRING, 
    owner:DataTypes.STRING, 
    cost:DataTypes.STRING, 
    name_owner:DataTypes.STRING
  });
  return Items;
};
