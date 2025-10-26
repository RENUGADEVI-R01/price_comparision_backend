//src/routes/import.js
const express = require('express');
const router = express.Router();

// Sanity check route
router.get('/', (req, res) => {
  res.json({ message: 'Import route works (use scripts/import-csv.js to import CSV)' });
});

module.exports = router;
