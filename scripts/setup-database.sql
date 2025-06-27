-- Music App Database Setup Script
-- This script creates the database, user, and sets up permissions

-- Variables (modify these as needed)
-- Database name: music_app (development), music_app_prod (production)
-- Username: music_app_user
-- Password: admin123 (change in production)

-- =============================================================================
-- DEVELOPMENT ENVIRONMENT SETUP
-- =============================================================================

-- Create development database
CREATE DATABASE IF NOT EXISTS `music_app_dev` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create development user
CREATE USER IF NOT EXISTS 'music_app_user'@'localhost' IDENTIFIED BY 'admin123';
CREATE USER IF NOT EXISTS 'music_app_user'@'%' IDENTIFIED BY 'admin123';

-- Grant privileges for development
GRANT ALL PRIVILEGES ON `music_app_dev`.* TO 'music_app_user'@'localhost';
GRANT ALL PRIVILEGES ON `music_app_dev`.* TO 'music_app_user'@'%';

-- =============================================================================
-- PRODUCTION ENVIRONMENT SETUP
-- =============================================================================

-- Create production database
CREATE DATABASE IF NOT EXISTS `music_app_prod` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create production user with stronger password
CREATE USER IF NOT EXISTS 'music_app_prod'@'localhost' IDENTIFIED BY 'SecurePassword123!';
CREATE USER IF NOT EXISTS 'music_app_prod'@'%' IDENTIFIED BY 'SecurePassword123!';

-- Grant privileges for production
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `music_app_prod`.* TO 'music_app_prod'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `music_app_prod`.* TO 'music_app_prod'@'%';

-- =============================================================================
-- TEST ENVIRONMENT SETUP
-- =============================================================================

-- Create test database
CREATE DATABASE IF NOT EXISTS `music_app_test` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Grant test privileges to development user
GRANT ALL PRIVILEGES ON `music_app_test`.* TO 'music_app_user'@'localhost';
GRANT ALL PRIVILEGES ON `music_app_test`.* TO 'music_app_user'@'%';

-- =============================================================================
-- APPLY CHANGES
-- =============================================================================

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Show created databases
SHOW DATABASES LIKE 'music_app%';

-- Show created users
SELECT User, Host FROM mysql.user WHERE User LIKE 'music_app%';

-- Show grants for development user
SHOW GRANTS FOR 'music_app_user'@'localhost';

-- Show grants for production user (uncomment if needed)
-- SHOW GRANTS FOR 'music_app_prod'@'localhost';

-- =============================================================================
-- CLEANUP COMMANDS (USE WITH CAUTION)
-- =============================================================================

-- Uncomment these lines if you need to remove everything and start over
-- DROP DATABASE IF EXISTS `music_app_dev`;
-- DROP DATABASE IF EXISTS `music_app_prod`;
-- DROP DATABASE IF EXISTS `music_app_test`;
-- DROP USER IF EXISTS 'music_app_user'@'localhost';
-- DROP USER IF EXISTS 'music_app_user'@'%';
-- DROP USER IF EXISTS 'music_app_prod'@'localhost';
-- DROP USER IF EXISTS 'music_app_prod'@'%';
-- FLUSH PRIVILEGES;

-- =============================================================================
-- NOTES
-- =============================================================================

-- 1. Change default passwords before using in production
-- 2. Consider using SSL connections for production
-- 3. Regularly backup your databases
-- 4. Monitor user access and permissions
-- 5. Use environment-specific databases to avoid conflicts

-- To execute this script:
-- mysql -u root -p < setup-database.sql

-- To connect to the database after setup:
-- mysql -u music_app_user -p music_app_dev
