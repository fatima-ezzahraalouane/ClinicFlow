const AppError = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError(404, `Route introuvable : ${req.method} ${req.originalUrl}`));
}

module.exports = notFound;
