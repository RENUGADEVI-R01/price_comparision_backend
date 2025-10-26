// src/routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// ------------------------------
// Get all unique products (grouped by np_id)
// ------------------------------
router.get('/', async (req, res) => {
  try {
    // Optional limit query parameter
    const limit = req.query.limit ? parseInt(req.query.limit) : null;

    let query = `
      SELECT 
        np_id,
        MIN(id) AS sample_id,
        ANY_VALUE(product_name) AS product_name,
        ANY_VALUE(description) AS description,
        ANY_VALUE(category) AS category,
        ANY_VALUE(sub_category) AS sub_category,
        ANY_VALUE(image_url) AS image_url,
        ANY_VALUE(brand_name) AS brand_name
      FROM listings_new
      GROUP BY np_id
    `;

    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('DB error (get all products):', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ------------------------------
// Get product by np_id (all listings, prices, suggestions)
// ------------------------------
router.get('/id/:np_id', async (req, res) => {
  const np_id = req.params.np_id;

  try {
    const [listings] = await db.query(
      `SELECT 
         id,
         np_id,
         site,
         site_url,
         image_url,
         product_name,
         description,
         category,
         sub_category,
         brand_name,
         rating,
         trust_score,
         free_delivery,
         cash_on_delivery,
         days_to_deliver,
         discount_percentage,
         return_policy
       FROM listings_new
       WHERE np_id = ?`,
      [np_id]
    );

    if (listings.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [prices] = await db.query(
      `SELECT 
         CASE 
           WHEN site = 'relianceigital' THEN 'reliancedigital'
           ELSE site 
         END AS site,
         MIN(price) AS price
       FROM prices_new
       WHERE product_id IN (SELECT id FROM listings_new WHERE np_id = ?)
       GROUP BY site`,
      [np_id]
    );

    let suggestions = {};
    const [psRows] = await db.query(
      `SELECT suggestion1, suggestion2 
       FROM product_suggestion 
       WHERE product_id = ? 
       LIMIT 1`,
      [np_id]
    );

    if (psRows.length > 0) {
      suggestions = {
        suggestion1: psRows[0].suggestion1?.toString().trim(),
        suggestion2: psRows[0].suggestion2?.toString().trim()
      };
    }

    res.json({ np_id, listings, prices, suggestions });
  } catch (err) {
    console.error('DB error (get product by np_id):', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ------------------------------
// Search products by name or description (unique by np_id)
// ------------------------------
router.get('/search', async (req, res) => {
  const searchTerm = req.query.q;
  if (!searchTerm) return res.status(400).json({ error: 'Missing search query' });

  try {
    const [rows] = await db.query(
      `SELECT 
         np_id,
         ANY_VALUE(product_name) AS product_name,
         ANY_VALUE(description) AS description,
         ANY_VALUE(category) AS category,
         ANY_VALUE(sub_category) AS sub_category,
         ANY_VALUE(brand_name) AS brand_name
       FROM listings_new
       WHERE product_name LIKE ? OR description LIKE ?
       GROUP BY np_id`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );

    res.json(rows);
  } catch (err) {
    console.error('DB error (search products):', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ------------------------------
// Get product by exact name (unique by np_id)
// ------------------------------
router.get('/name/:product_name', async (req, res) => {
  const productName = req.params.product_name;

  try {
    const [rows] = await db.query(
      `SELECT 
         np_id,
         ANY_VALUE(product_name) AS product_name,
         ANY_VALUE(description) AS description,
         ANY_VALUE(category) AS category,
         ANY_VALUE(sub_category) AS sub_category,
         ANY_VALUE(brand_name) AS brand_name
       FROM listings_new
       WHERE product_name = ?
       GROUP BY np_id`,
      [productName]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(rows);
  } catch (err) {
    console.error('DB error (get product by name):', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ------------------------------
// Filter products by category/sub-category
// ------------------------------
router.get('/filter', async (req, res) => {
  const { category, sub_category } = req.query;

  try {
    let query = `
      SELECT 
        np_id,
        ANY_VALUE(product_name) AS product_name,
        ANY_VALUE(description) AS description,
        ANY_VALUE(category) AS category,
        ANY_VALUE(sub_category) AS sub_category,
        ANY_VALUE(image_url) AS image_url,
        ANY_VALUE(brand_name) AS brand_name
      FROM listings_new
    `;
    const params = [];

    if (category || sub_category) {
      query += ' WHERE';
      if (category) {
        query += ' category = ?';
        params.push(category);
      }
      if (category && sub_category) query += ' AND';
      if (sub_category) {
        query += ' sub_category = ?';
        params.push(sub_category);
      }
    }

    query += ' GROUP BY np_id';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('DB error (filter products):', err);
    res.status(500).json({ error: 'Failed to fetch filtered products' });
  }
});

// ------------------------------
// Get all unique categories and sub-categories
// ------------------------------
router.get('/filters', async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT DISTINCT category FROM listings_new WHERE category IS NOT NULL`
    );
    const [subCategories] = await db.query(
      `SELECT DISTINCT sub_category, category AS parent 
       FROM listings_new WHERE sub_category IS NOT NULL`
    );

    res.json({
      categories: categories.map(c => c.category),
      sub_categories: subCategories.map(sc => ({ name: sc.sub_category, parent: sc.parent }))
    });
  } catch (err) {
    console.error('DB error (get filter metadata):', err);
    res.status(500).json({ error: 'Failed to fetch filter metadata' });
  }
});

module.exports = router;
