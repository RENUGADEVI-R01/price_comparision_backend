@echo off
echo 🚀 Setting up Price Comparison Database...

REM Check if MySQL is running
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo ❌ MySQL is not running. Please start MySQL first.
    pause
    exit /b 1
)

REM Create database if it doesn't exist
echo 📦 Creating database...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS price_compare;"

REM Run the schema creation
echo 🏗️ Creating tables...
mysql -u root price_compare < seed/updated_schema.sql

REM Import the data
echo 📥 Importing data...
node scripts/import-dataset.js

echo ✅ Database setup complete!
echo 🎉 You can now start the backend server with: npm start
pause


