const sequelize = require('../configuration/mysqlConnection');
const { DataTypes, Model } = require('sequelize');

class Tasks extends Model { }

Tasks.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  etag: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  sequelize
});

sequelize.sync();

module.exports = { Tasks };