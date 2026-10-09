const { readTier } = require("./access-cookie");

module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ tier: readTier(req) });
};
