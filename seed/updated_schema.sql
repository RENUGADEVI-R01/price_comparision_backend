-- Use your database
CREATE DATABASE IF NOT EXISTS price_compare;
USE price_compare;

-- Drop tables if they exist (reverse dependency order)
DROP TABLE IF EXISTS suggestions;
DROP TABLE IF EXISTS prices;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS vendors;

-- Vendors table
CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    np_id VARCHAR(100),
    site VARCHAR(100),
    site_url TEXT,
    product_name VARCHAR(500) NOT NULL,
    image_url TEXT,
    category VARCHAR(200),
    sub_category VARCHAR(200),
    description TEXT,
    free_delivery VARCHAR(50),
    cash_on_delivery VARCHAR(50),
    days_to_deliver INT,
    discount_percentage DECIMAL(5,2),
    return_policy VARCHAR(200),
    brand_name VARCHAR(200),
    reviews INT,
    rating DECIMAL(3,2),
    trust_score DECIMAL(5,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_name (product_name),
    INDEX idx_category (category),
    INDEX idx_sub_category (sub_category),
    INDEX idx_brand_name (brand_name)
);

-- Prices table
CREATE TABLE prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pride_id VARCHAR(100),
    product_id INT NOT NULL,
    vendor_id INT NOT NULL,
    site VARCHAR(100),
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    product_url TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_in_stock TINYINT(1) DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_site (site)
);

-- Suggestions table
CREATE TABLE suggestions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    suggestion1 INT,
    suggestion2 INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (suggestion1) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (suggestion2) REFERENCES products(id) ON DELETE CASCADE
);
