const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const config = require('../config/env');
const AppError = require('../utils/AppError');

async function login(email, password) {
  const { rows } = await pool.query(
    'SELECT id, full_name, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  return {
    token,
    user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
  };
}

async function getMe(userId) {
  const { rows } = await pool.query(
    `SELECT id, full_name AS "fullName", email, role, created_at AS "createdAt"
     FROM users WHERE id = $1`,
    [userId]
  );

  if (rows.length === 0) {
    throw new AppError(404, 'User not found');
  }

  return rows[0];
}

module.exports = { login, getMe };
