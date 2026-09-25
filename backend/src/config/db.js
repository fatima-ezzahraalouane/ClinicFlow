const { Pool, types } = require('pg');
const config = require('./env');

types.setTypeParser(1082, (value) => value);

const pool = new Pool(config.db);

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

module.exports = pool;
