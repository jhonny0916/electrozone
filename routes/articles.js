const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM articles');
  res.json(rows);
});

router.get('/search', async (req, res) => {
  const { q } = req.query;
  const [rows] = await db.query('SELECT * FROM articles WHERE name LIKE ? OR characteristics LIKE ?'
                               , [`%${q}%`, `%${q}%`]);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  if (!req.params.id) return res.status(400).json({ message: 'ID is required' });
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;