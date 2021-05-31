const sequelize = require('../configuration/mysqlConnection.js');
const { DataTypes, Model } = require('sequelize');

class Images extends Model { };

Images.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  md5Content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resolution: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  timestamps: true,
  updatedAt: false
});

Images.hasOne(Images, {
  foreignKey: 'originalId'
});

sequelize.sync();

module.exports = { Images };