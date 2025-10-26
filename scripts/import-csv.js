//scripts/import-csv.js
require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');

// DB Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'price_compare',
});

console.log('✅ Connected to MySQL successfully!');

// CSV file paths
const PRODUCTS_FILE = "./data/productList.csv";
const PRICES_FILE = "./data/prices.csv";
const SUGGESTIONS_FILE = "./data/suggestions.csv";

// Helper to read CSV
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

// Import vendors
async function importVendors(rows) {
  console.log('🚀 Importing vendors...');
  const uniqueVendors = {};
  rows.forEach(r => { if(r.site) uniqueVendors[r.site.toLowerCase()] = r.site_url || null; });

  for (const [name, url] of Object.entries(uniqueVendors)) {
    await pool.query(
      `INSERT INTO vendors (name, url)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE url = VALUES(url)`,
      [name, url]
    );
  }
  console.log(`✅ Imported ${Object.keys(uniqueVendors).length} vendors`);
}

// Import products
async function importProducts() {
  console.log('🚀 Importing products...');
  const rows = await readCSV(PRODUCTS_FILE);

  for (const row of rows) {
    await pool.query(
      `INSERT INTO products (
        np_id, site, site_url, product_name, image_url, category, sub_category,
        description, free_delivery, cash_on_delivery, days_to_deliver,
        discount_percentage, return_policy, brand_name, reviews, rating, trust_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        site = VALUES(site),
        site_url = VALUES(site_url),
        product_name = VALUES(product_name),
        image_url = VALUES(image_url),
        category = VALUES(category),
        sub_category = VALUES(sub_category),
        description = VALUES(description),
        free_delivery = VALUES(free_delivery),
        cash_on_delivery = VALUES(cash_on_delivery),
        days_to_deliver = VALUES(days_to_deliver),
        discount_percentage = VALUES(discount_percentage),
        return_policy = VALUES(return_policy),
        brand_name = VALUES(brand_name),
        reviews = VALUES(reviews),
        rating = VALUES(rating),
        trust_score = VALUES(trust_score),
        updated_at = NOW()
      `,
      [
        row.np_id || null,
        row.site || null,
        row.site_url || null,
        row.product_name || 'Unnamed Product',
        row.image_url || null,
        row.category || null,
        row.sub_category || null,
        row.description || null,
        row.free_delivery || null,
        row.cash_on_delivery || null,
        row.days_to_deliver ? parseInt(row.days_to_deliver) : null,
        row.discount_percentage ? parseFloat(row.discount_percentage) : null,
        row.return_policy || null,
        row.brand_name || null,
        row.reviews ? parseInt(row.reviews) : null,
        row.rating ? parseFloat(row.rating) : null,
        row['trust score'] ? parseFloat(row['trust score']) : null
      ]
    );
  }

  await importVendors(rows);
  console.log(`✅ Imported ${rows.length} products`);
}

// Import prices
async function importPrices() {
  console.log('🚀 Importing prices...');
  const rows = await readCSV(PRICES_FILE);

  // Build vendor map
  const [vendors] = await pool.query('SELECT id, name FROM vendors');
  const vendorMap = {};
  vendors.forEach(v => vendorMap[v.name.toLowerCase()] = v.id);

  for (const row of rows) {
    const vendorId = vendorMap[row.site.toLowerCase()];
    if (!vendorId) continue;

    await pool.query(
      `INSERT INTO prices (pride_id, product_id, vendor_id, site, price)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE price = VALUES(price), site = VALUES(site)`,
      [row.pride_id || null, row.product_id ? parseInt(row.product_id) : null, vendorId, row.site, row.price ? parseFloat(row.price) : 0]
    );
  }

  console.log(`✅ Imported ${rows.length} prices`);
}

// Import suggestions
async function importSuggestions() {
  console.log('🚀 Importing suggestions...');
  const rows = await readCSV(SUGGESTIONS_FILE);

  for (const row of rows) {
    await pool.query(
      `INSERT INTO suggestions (product_id, suggestion1, suggestion2)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         suggestion1 = VALUES(suggestion1),
         suggestion2 = VALUES(suggestion2)`,
      [
        row.product_id ? parseInt(row.product_id) : null,
        row.suggestion1 ? parseInt(row.suggestion1) : null,
        row.suggestion2 ? parseInt(row.suggestion2) : null
      ]
    );
  }

  console.log(`✅ Imported ${rows.length} suggestions`);
}

// Run all imports
(async () => {
  try {
    await importProducts();
    await importPrices();
    await importSuggestions();
    console.log('🎉 All CSVs imported successfully!');
    process.exit(0);
  } catch (err) {
    console.error('💥 CSV import failed:', err);
    process.exit(1);
  }
})();
