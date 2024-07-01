const mysql = require('mysql2/promise');
const { collegesPool } = require('../config/dbconfig');

const setupDatabaseConnection = async (req, res, next) => {
  const { college_code } = req.query;

  if (!college_code) {
    return res.status(400).json({ error: 'college_code is a required parameter' });
  }

  try {
    const collegeSql = 'SELECT college_code FROM College WHERE college_code = ?';
    const [collegeResults] = await collegesPool.query(collegeSql, [college_code]);

    if (collegeResults.length === 0) {
      return res.status(404).json({ error: 'College code not found' });
    }

    const dbName = collegeResults[0].college_code;

    req.collegePool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10, // Adjust this number based on your needs
      queueLimit: 0

    });

    next();
  } catch (error) {
    console.error('Error setting up database connection:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const closeDatabaseConnection = async (req, res, next) => {
  if (req.collegePool) {
    try {
      await req.collegePool.end();
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
  if (next) next(); // Ensure next exists before calling it
};

module.exports = {
  setupDatabaseConnection,
  closeDatabaseConnection
};
