const app = require('./app');
const pool = require('./config/db');
const config = require('./config/env');

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL');

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  }
}

start();
