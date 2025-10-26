//src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const importRoutes = require('./routes/import');
const productRoutes = require('./routes/products');
const vendorRoutes = require('./routes/vendors');

const app = express();
app.use(cors());
app.use(express.json());

// Root check
app.get('/', (req, res) => res.send('Backend running successfully!'));

// Check product count
app.get('/check-products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS cnt FROM listings_new');
    if (!rows.length || rows[0].cnt === 0) return res.status(404).json({ message: 'No products found' });
    res.json({ count: rows[0].cnt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch error' });
  }
});

// Routes
app.use('/api/import', importRoutes);
app.use('/api/products', productRoutes);
app.use('/api/vendors', vendorRoutes);

// Start server
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
