const AppError = require('../utils/AppError');

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(403, "Vous n'avez pas la permission d'effectuer cette action");
    }
    next();
  };
}

module.exports = requireRole;
