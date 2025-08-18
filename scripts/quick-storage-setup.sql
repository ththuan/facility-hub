-- Quick setup script for Supabase Storage (Public Access)
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Create bucket (public = true for easy access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Remove any existing restrictive policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete documents" ON storage.objects;

-- 3. Create simple public policy for all operations
CREATE POLICY "Allow public access to documents bucket"
ON storage.objects
FOR ALL 
TO public
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- 4. Verify setup
SELECT 
    'Bucket Status' as check_type,
    id as bucket_id, 
    name as bucket_name, 
    public::text as is_public
FROM storage.buckets 
WHERE id = 'documents'

UNION ALL

SELECT 
    'Policy Status' as check_type,
    policyname as bucket_id,
    cmd as bucket_name,
    'enabled' as is_public
FROM pg_policies 
WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname LIKE '%documents%';
