-- Clean Database Script
-- This script removes all existing data to ensure fresh setup

-- Drop all existing data (in correct order due to foreign keys)
-- Use IF EXISTS to avoid errors if tables don't exist
DO $$
BEGIN
    -- Delete data only if tables exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'work_orders') THEN
        DELETE FROM work_orders;
        RAISE NOTICE 'Cleaned work_orders table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'documents') THEN
        DELETE FROM documents;
        RAISE NOTICE 'Cleaned documents table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'devices') THEN
        DELETE FROM devices;
        RAISE NOTICE 'Cleaned devices table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rooms') THEN
        DELETE FROM rooms;
        RAISE NOTICE 'Cleaned rooms table';
    END IF;
END $$;

-- Reset sequences (if any)
-- Note: UUID doesn't need sequence reset

-- Optional: Reset all tables completely (uncomment if needed)
-- DROP TABLE IF EXISTS work_orders CASCADE;
-- DROP TABLE IF EXISTS documents CASCADE;
-- DROP TABLE IF EXISTS devices CASCADE;
-- DROP TABLE IF EXISTS rooms CASCADE;

-- Drop ENUMs if you want to recreate them
-- DROP TYPE IF EXISTS device_status CASCADE;
-- DROP TYPE IF EXISTS priority_level CASCADE;
-- DROP TYPE IF EXISTS wo_status CASCADE;
-- DROP TYPE IF EXISTS doc_type CASCADE;

-- Success message
SELECT 'Database cleaned successfully! Now run setup-database.sql' as status,
       'Tables checked and cleaned where they existed' as message;
