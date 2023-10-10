// 'use strict';
module.exports = (sequelize, DataTypes) => {
  const History = sequelize.define('History', {
    psid: DataTypes.STRING,
    product: DataTypes.STRING,
    description: DataTypes.STRING,
    amount: DataTypes.STRING,
    profit: DataTypes.STRING
  });
  return History;
};
