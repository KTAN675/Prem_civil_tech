const mysql = require('mysql2/promise');

const host = process.env.DB_HOST || 'localhost';
const isLocal = host === 'localhost' || host === '127.0.0.1';

const pool = mysql.createPool({
  host: host,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'prem_civiltech',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: isLocal ? undefined : {
    rejectUnauthorized: false
  }
});

module.exports = pool;
