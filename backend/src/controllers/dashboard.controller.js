const dashboardService = require('../services/dashboard.service');

async function getStats(req, res) {
  const stats = await dashboardService.getStats();
  res.json(stats);
}

module.exports = { getStats };
