const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) return res.status(400).json({ error: 'Invalid user id' });

  try {
    const [rows] = await db.query(
      `SELECT id, total, created_at
       FROM bills
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:userId/:billId/items', async (req, res) => {
  const userId = Number(req.params.userId);
  const billId = Number(req.params.billId);
  if (!userId || !billId) return res.status(400).json({ error: 'Invalid ids' });

  try {
    const [billRows] = await db.query(
      `SELECT id, total, created_at
       FROM bills
       WHERE id = ? AND user_id = ?`,
      [billId, userId]
    );

    if (billRows.length === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const [itemRows] = await db.query(
      `SELECT bi.article_id, a.name AS article_name, bi.quantity, bi.price
       FROM bill_items bi
       JOIN articles a ON a.id = bi.article_id
       WHERE bill_id = ?
       ORDER BY bi.id ASC`,
      [billId]
    );

    res.json({
      bill: billRows[0],
      items: itemRows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
