const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/add', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  console.log(productId);
  await db.query('INSERT INTO cart (user_id, article_id, quantity) VALUES (?, ?, ?)', [userId, productId, quantity]);
  res.json({ message: 'Added to cart' });
});

router.post('/update', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (!userId || !productId || quantity == null) return res.status(400).json({ error: 'Missing data' });

  try {
    if (quantity === 0) {
      await db.query('DELETE FROM cart WHERE user_id = ? AND article_id = ?', [userId, productId]);
    } else {
      await db.query('UPDATE cart SET quantity = ? WHERE user_id = ? AND article_id = ?', [quantity, userId, productId]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating cart' });
  }
});

router.get('/:userId', async (req, res) => {
  const [rows] = await db.query(`
    SELECT a.name, a.price, c.quantity, c.article_id, a.characteristics, a.stock
    FROM cart c
    JOIN articles a ON c.article_id = a.id
    WHERE c.user_id = ? AND c.paid = false`, [req.params.userId]);
  res.json(rows);
});

router.post('/pay', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId requerido' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Get unpaid cart items
    const [cartItems] = await conn.execute(
      `SELECT ci.article_id, ci.quantity, a.price, a.stock
       FROM cart ci
       JOIN articles a ON ci.article_id = a.id
       WHERE ci.user_id = ? AND ci.paid = false`,
      [userId]
    );

    if (cartItems.length === 0) {
      await conn.release();
      return res.json({ message: 'El carrito ya está vacío.', totalPaid: 0 });
    }

    let totalPaid = 0;

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await conn.rollback();
        await conn.release();
        return res.status(400).json({ error: `No hay suficiente stock para el producto ${item.article_id}` });
      }

      totalPaid += item.price * item.quantity;

      await conn.execute(
        'UPDATE articles SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.article_id]
      );
    }

    await conn.execute(
      'UPDATE cart SET paid = true WHERE user_id = ? AND paid = false',
      [userId]
    );

    await conn.commit();
    await conn.release();

    res.json({ message: 'Su compra fue exitosa.', totalPaid });

  } catch (err) {
    await conn.rollback();
    await conn.release();
    console.error(err);
    res.status(500).json({ error: 'Error al procesar el pago.' });
  }
});

module.exports = router;