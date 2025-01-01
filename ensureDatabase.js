const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();


async function ensureDatabase() {
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const connectionString = process.env.DB_CONNECTION_STRING; 
    const host = process.env.DB_HOST; 
    const port = process.env.DB_PORT; 
    const connection = await mysql.createConnection({
        host: host,
        user: user,
        password: password,
        port: port,
       
    });
    await connection.end();
}

module.exports = ensureDatabase;
