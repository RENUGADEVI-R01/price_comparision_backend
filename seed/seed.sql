-- backend/seed/seed.sql
USE price_compare;

-- 🔓 Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables in proper order (children first)
DROP TABLE IF EXISTS prices;
DROP TABLE IF EXISTS suggestions;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS products;

-- 🔐 Re-enable foreign key checks after drops
SET FOREIGN_KEY_CHECKS = 1;

-- Create products table
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(100) UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at DATETIME,
  updated_at DATETIME
);

-- Create vendors table
CREATE TABLE vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  url VARCHAR(255),
  created_at DATETIME
);

-- Create prices table
CREATE TABLE prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  vendor_id INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  product_url TEXT,
  scraped_at DATETIME,
  is_in_stock TINYINT(1) DEFAULT 1,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Create suggestions table (if used)
CREATE TABLE suggestions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  suggestion1 VARCHAR(255),
  suggestion2 VARCHAR(255),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

