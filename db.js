const mysql = require('mysql2');
const pool = mysql.createPool({
  host: 'jhonnypoligran.mysql.database.azure.com',
  user: 'jalardilapoli',
  password: 'poli2024*',
  database: 'electrozone'
});
module.exports = pool.promise();