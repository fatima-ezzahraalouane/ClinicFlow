// One shared connection pool for the whole app.
// Services import `pool` and run parameterized queries: pool.query(sql, [values]).
const { Pool, types } = require('pg');
const config = require('./env');

// By default pg turns a DATE column into a JS Date at local midnight, which JSON
// then serializes in UTC ("1985-03-12" can become "1985-03-11T23:00:00.000Z").
// Keep DATE values as plain 'YYYY-MM-DD' strings instead. 1082 = PostgreSQL DATE type id.
types.setTypeParser(1082, (value) => value);

const pool = new Pool(config.db);

// An idle client can lose its connection (e.g. DB restart): log it instead of crashing silently.
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

module.exports = pool;
