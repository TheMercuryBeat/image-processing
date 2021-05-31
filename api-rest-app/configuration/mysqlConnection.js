import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';

const database = process.env.DATABASE || 'shopdb';
const user = process.env.USER || 'root';
const password = process.env.PASSWORD || 'P@ssword2';
const host = process.env.HOST || '127.0.0.1';

export default new Sequelize(database, user, password, {
    host: host,
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: false
});

process.on('exit', async () => {
    await sequelize.close();
});
