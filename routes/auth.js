const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/register', async (req, res) => {
  const { username } = req.body;
  try{
     const [rows] = await db.query('INSERT INTO users (username) VALUES (?)', [username]);
     res.json({ userId: rows.insertId });
  }
  catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'El correo ya está registrado' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Error al registrar el usuario' });
    }
  }
  
});

router.post('/login', async (req, res) => {
  const { username } = req.body;

  if (!username) return res.status(400).json({ message: 'Username required' });

  try {
    const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ userId: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;