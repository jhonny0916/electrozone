const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'electrozone',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const admin = {
  user: process.env.ADMIN_USER || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin',
}

const db = pool.promise();

// Expose admin credentials config so auth can reuse the same env/default fallback.
db.admin = admin;

module.exports = db;