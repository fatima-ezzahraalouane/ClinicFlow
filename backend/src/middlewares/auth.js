const jwt = require('jsonwebtoken');
const config = require('../config/env');
const AppError = require('../utils/AppError');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'Authentication token missing');
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
}

module.exports = authenticate;
