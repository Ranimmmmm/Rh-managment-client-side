const mysql = require('mysql2/promise');

async function ensureDatabase() {
    const databaseName = 'employee'; // Your database name
    const user = 'root';
    const password = 'root123.';
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: user,
        password: password
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`);
    await connection.end();
}

module.exports = ensureDatabase;
