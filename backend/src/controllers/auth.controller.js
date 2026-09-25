const authService = require('../services/auth.service');

async function login(req, res) {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
}

async function me(req, res) {
  const user = await authService.getMe(req.user.id);
  res.json({ user });
}

module.exports = { login, me };
