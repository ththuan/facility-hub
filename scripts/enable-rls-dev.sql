-- Enable RLS for development (Permissive policies for testing)
-- This script enables Row Level Security with permissive policies for development

-- Enable RLS on all main tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;  
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development (allows all operations)
-- In production, you should replace these with more restrictive policies

-- Rooms policies - Allow all operations for now
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rooms' AND policyname = 'dev_rooms_policy') THEN
        CREATE POLICY "dev_rooms_policy" ON rooms FOR ALL USING (true);
    END IF;
END $$;

-- Devices policies - Allow all operations for now  
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'devices' AND policyname = 'dev_devices_policy') THEN
        CREATE POLICY "dev_devices_policy" ON devices FOR ALL USING (true);
    END IF;
END $$;

-- Documents policies - Allow all operations for now
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'dev_documents_policy') THEN
        CREATE POLICY "dev_documents_policy" ON documents FOR ALL USING (true);
    END IF;
END $$;

-- Work orders policies - Allow all operations for now
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'work_orders' AND policyname = 'dev_work_orders_policy') THEN
        CREATE POLICY "dev_work_orders_policy" ON work_orders FOR ALL USING (true);
    END IF;
END $$;

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled",
    (SELECT count(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as "Policies Count"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('rooms', 'devices', 'documents', 'work_orders')
ORDER BY tablename;
