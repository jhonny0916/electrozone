const crypto = require('crypto');
const db = require('../db');

// Session token generated at startup; resets on server restart
const ADMIN_SESSION_TOKEN = crypto.randomBytes(32).toString('hex');
const ADMIN_USER = db.admin?.user;
const ADMIN_PASSWORD = db.admin?.password;

if (!ADMIN_PASSWORD) {
  console.warn('WARNING: Admin credentials are not configured. Admin login will be disabled.');
}

function requireAdminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token && token === ADMIN_SESSION_TOKEN) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { ADMIN_SESSION_TOKEN, ADMIN_USER, ADMIN_PASSWORD, requireAdminAuth };
