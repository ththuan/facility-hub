-- Simple Setup - Skip Clean Step
-- This script can be run directly without cleaning first

-- Just run the main setup script
-- If tables exist, the INSERT statements will be skipped due to NOT EXISTS checks

SELECT 'Starting database setup...' as status;

-- You can now run setup-database.sql directly
-- The script handles duplicates automatically with NOT EXISTS checks
