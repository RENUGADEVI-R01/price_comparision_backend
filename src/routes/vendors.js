//src/routes/vendors.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM vendors");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Get listings for a specific product
router.get('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT p.id, p.site as website_name, p.site_url as url, pr.price, 
             p.rating, p.trust_score, p.free_delivery, p.cash_on_delivery,
             p.days_to_deliver as estimated_delivery_days, p.return_policy,
             p.discount_percentage, p.reviews
      FROM products p
      LEFT JOIN prices pr ON p.id = pr.product_id
      WHERE p.id = ?
      ORDER BY pr.price ASC
    `, [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product listings' });
  }
});

module.exports = router;
