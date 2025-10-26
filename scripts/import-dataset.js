//scripts/import-dataset.js

// Updated import script to match the actual dataset structure
const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');

// Create database connection directly
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'MAHAKAN',
  database: 'price_compare',
});

console.log('Database connection configured');

const PRODUCTS_FILE = "./data/productList.csv";
const PRICES_FILE = "./data/prices.csv";
const SUGGESTIONS_FILE = "./data/suggestions.csv";

/**
 * Import products from listings_new.csv
 */
async function importProducts() {
  console.log('Starting products import...');
  const rows = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(PRODUCTS_FILE)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', async () => {
        try {
          for (const row of rows) {
            await pool.query(`
              INSERT INTO products (
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
            `, [
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
            ]);
          }
          console.log(`Imported ${rows.length} products successfully!`);
          resolve();
        } catch (err) {
          console.error('Product import failed:', err);
          reject(err);
        }
      })
      .on('error', reject);
  });
}

/**
 * Import prices from prices_new.csv
 */
async function importPrices() {
  console.log('Starting prices import...');
  const rows = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(PRICES_FILE)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', async () => {
        try {
          for (const row of rows) {
            await pool.query(`
              INSERT INTO prices (pride_id, product_id, site, price)
              VALUES (?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                price = VALUES(price),
                site = VALUES(site)
            `, [
              row.pride_id || null,
              row.product_id ? parseInt(row.product_id) : null,
              row.site || null,
              row.price ? parseFloat(row.price) : 0
            ]);
          }
          console.log(`Imported ${rows.length} prices successfully!`);
          resolve();
        } catch (err) {
          console.error('Price import failed:', err);
          reject(err);
        }
      })
      .on('error', reject);
  });
}

/**
 * Import suggestions from product_suggestion.csv
 */
async function importSuggestions() {
  console.log('Starting suggestions import...');
  const rows = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(SUGGESTIONS_FILE)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', async () => {
        try {
          for (const row of rows) {
            await pool.query(`
              INSERT INTO suggestions (product_id, suggestion1, suggestion2)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE
                suggestion1 = VALUES(suggestion1),
                suggestion2 = VALUES(suggestion2)
            `, [
              row.product_id ? parseInt(row.product_id) : null,
              row.suggestion1 ? parseInt(row.suggestion1) : null,
              row.suggestion2 ? parseInt(row.suggestion2) : null
            ]);
          }
          console.log(`Imported ${rows.length} suggestions successfully!`);
          resolve();
        } catch (err) {
          console.error('Suggestions import failed:', err);
          reject(err);
        }
      })
      .on('error', reject);
  });
}

/**
 * Main import function
 */
async function runImport() {
  try {
    console.log('Starting data import process...');
    
    await importProducts();
    await importPrices();
    await importSuggestions();
    
    console.log('All data imported successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Import process failed:', err);
    process.exit(1);
  }
}

// Run the import
runImport();
