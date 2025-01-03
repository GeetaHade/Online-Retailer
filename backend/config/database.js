const mysql = require('mysql2');

const mysqlConnection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '', // No password for root in your case
  database: 'online_retailer'
});

mysqlConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

module.exports = { mysqlConnection };
