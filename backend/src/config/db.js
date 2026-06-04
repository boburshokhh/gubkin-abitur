const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/abitur',
});

// Проверка подключения при старте
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Ошибка подключения к PostgreSQL:', err.message);
  } else {
    console.log('Успешное подключение к PostgreSQL в', res.rows[0].now);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
