require('dotenv').config();
console.log('Database URL:', process.env.DATABASE_URL);
const db = require('./knex');

async function testConnection() {
  try {
    await db.raw('SELECT 1+1 AS result');
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    db.destroy();
  }
}

testConnection();