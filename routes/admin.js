const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { ADMIN_SESSION_TOKEN, ADMIN_PASSWORD } = require('./adminAuth');

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

router.use(adminLimiter);

// Admin login
router.post('/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'Admin login is not configured' });
  if (password === ADMIN_PASSWORD) {
    res.json({ token: ADMIN_SESSION_TOKEN });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

module.exports = router;
