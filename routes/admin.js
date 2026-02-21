const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

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

// Create stock_history tables if not exists
db.query(`
  CREATE TABLE IF NOT EXISTS stock_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_type ENUM('add', 'decrease') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(console.error);

db.query(`
  CREATE TABLE IF NOT EXISTS stock_history_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    history_id INT NOT NULL,
    article_id INT NOT NULL,
    article_name VARCHAR(255),
    units_changed INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    FOREIGN KEY (history_id) REFERENCES stock_history(id)
  )
`).catch(console.error);

// Get all products
router.get('/products', requireAdminAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, stock, price FROM articles ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update stock for multiple products
router.post('/stock', requireAdminAuth, async (req, res) => {
  const { action, updates } = req.body;
  // updates: [{ productId, units }]
  if (!action || !['add', 'decrease'].includes(action) || !Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  // Validate basic input before acquiring a connection
  for (const item of updates) {
    if (!item.productId || item.units == null || item.units <= 0) {
      return res.status(400).json({ error: 'Each update must have a valid productId and positive units' });
    }
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Fetch all products in a single query and build a lookup map
    const productIds = updates.map(u => u.productId);
    const placeholders = productIds.map(() => '?').join(',');
    const [productRows] = await conn.execute(
      `SELECT id, name, stock FROM articles WHERE id IN (${placeholders})`,
      productIds
    );
    const productMap = {};
    productRows.forEach(p => { productMap[p.id] = p; });

    // Validate all products exist and have sufficient stock
    for (const item of updates) {
      if (!productMap[item.productId]) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      if (action === 'decrease' && productMap[item.productId].stock < item.units) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ error: `Insufficient stock for product with id ${item.productId}` });
      }
    }

    // Insert history record
    const [histResult] = await conn.execute(
      'INSERT INTO stock_history (action_type) VALUES (?)',
      [action]
    );
    const historyId = histResult.insertId;

    // Update each product and save history items using cached product data
    for (const item of updates) {
      const product = productMap[item.productId];
      const previousStock = product.stock;
      const newStock = action === 'add' ? previousStock + item.units : previousStock - item.units;

      await conn.execute('UPDATE articles SET stock = ? WHERE id = ?', [newStock, item.productId]);

      await conn.execute(
        'INSERT INTO stock_history_items (history_id, article_id, article_name, units_changed, previous_stock, new_stock) VALUES (?, ?, ?, ?, ?, ?)',
        [historyId, item.productId, product.name, item.units, previousStock, newStock]
      );
    }

    await conn.commit();
    conn.release();
    res.json({ success: true, historyId });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get stock update history
router.get('/history', requireAdminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT sh.id, sh.action_type, sh.created_at,
             shi.article_id, shi.article_name, shi.units_changed, shi.previous_stock, shi.new_stock
      FROM stock_history sh
      JOIN stock_history_items shi ON sh.id = shi.history_id
      ORDER BY sh.created_at DESC, sh.id DESC
    `);

    // Group items by history entry
    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.id]) {
        grouped[row.id] = {
          id: row.id,
          action_type: row.action_type,
          created_at: row.created_at,
          items: []
        };
      }
      grouped[row.id].items.push({
        article_id: row.article_id,
        article_name: row.article_name,
        units_changed: row.units_changed,
        previous_stock: row.previous_stock,
        new_stock: row.new_stock
      });
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
