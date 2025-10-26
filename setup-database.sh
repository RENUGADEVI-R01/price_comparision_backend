#!/bin/bash
# Database setup and import script

echo "🚀 Setting up Price Comparison Database..."

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ MySQL is not running. Please start MySQL first."
    exit 1
fi

# Create database if it doesn't exist
echo "📦 Creating database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS price_compare;"

# Run the schema creation
echo "🏗️ Creating tables..."
mysql -u root price_compare < seed/updated_schema.sql

# Import the data
echo "📥 Importing data..."
node scripts/import-dataset.js

echo "✅ Database setup complete!"
echo "🎉 You can now start the backend server with: npm start"

