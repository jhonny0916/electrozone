const crypto = require('crypto');

// Session token generated at startup; resets on server restart
const ADMIN_SESSION_TOKEN = crypto.randomBytes(32).toString('hex');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.warn('WARNING: ADMIN_PASSWORD environment variable is not set. Admin login will be disabled.');
}

function requireAdminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token && token === ADMIN_SESSION_TOKEN) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { ADMIN_SESSION_TOKEN, ADMIN_PASSWORD, requireAdminAuth };
