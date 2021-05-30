import sequelize from '../configuration/mysqlConnection.js';
import sequelizePkg from 'sequelize';

const { DataTypes, Model } = sequelizePkg;

export class Tasks extends Model { }

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
  path: DataTypes.STRING
}, {
  sequelize
});

await sequelize.sync();
