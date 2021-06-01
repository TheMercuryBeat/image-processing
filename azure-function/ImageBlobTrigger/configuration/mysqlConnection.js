const { Sequelize } = require('sequelize');
const { mysql2 } = require('mysql2');

const database = process.env.DATABASE || 'shopdb';
const user = process.env.USERNAME;
const password = process.env.PASSWORD;
const host = process.env.HOST || '127.0.0.1';

module.exports = new Sequelize(database, user, password, {
    host: host,
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: false
});

process.on('exit', async () => {
    await sequelize.close();
});
