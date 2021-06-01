const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');

const database = process.env.DATABASE || 'shopdb';
const user = process.env.USER || 'root';
const password = process.env.PASSWORD || 'P@ssword2';
const host = process.env.HOST || '127.0.0.1';

module.exports = new Sequelize(database, 'root', password, {
    host: host,
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: false
});

process.on('exit', async () => {
    await sequelize.close();
});
