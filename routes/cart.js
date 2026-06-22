const express = require('express');
const router = express.Router();
const db = require('../db');

db.query(`
  CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bills_user FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).catch(console.error);

db.query(`
  CREATE TABLE IF NOT EXISTS bill_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    article_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_bill_items_bill FOREIGN KEY (bill_id) REFERENCES bills(id),
    CONSTRAINT fk_bill_items_article FOREIGN KEY (article_id) REFERENCES articles(id)
  )
`).catch(console.error);

// Best-effort migration for existing databases with old bill columns.
db.query('ALTER TABLE bills CHANGE COLUMN total_amount total DECIMAL(10,2) NOT NULL DEFAULT 0.00').catch(() => {});
db.query('ALTER TABLE bill_items CHANGE COLUMN unit_price price DECIMAL(10,2) NOT NULL').catch(() => {});
db.query('ALTER TABLE bill_items DROP COLUMN article_name').catch(() => {});
db.query('ALTER TABLE bill_items DROP COLUMN line_total').catch(() => {});

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
      `SELECT ci.article_id, ci.quantity, a.name, a.price, a.stock
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

    const [billResult] = await conn.execute(
      'INSERT INTO bills (user_id, total) VALUES (?, ?)',
      [userId, totalPaid]
    );
    const billId = billResult.insertId;

    for (const item of cartItems) {
      const lineTotal = item.price * item.quantity;
      await conn.execute(
        `INSERT INTO bill_items (bill_id, article_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [billId, item.article_id, item.quantity, lineTotal]
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