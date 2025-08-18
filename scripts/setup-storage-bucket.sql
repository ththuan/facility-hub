-- Create Supabase Storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (should be enabled by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;

-- Create permissive policies for development (allows all operations for documents bucket)
CREATE POLICY "Public can upload documents" ON storage.objects
FOR INSERT TO public WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Public can view documents" ON storage.objects  
FOR SELECT TO public USING (bucket_id = 'documents');

CREATE POLICY "Public can update documents" ON storage.objects
FOR UPDATE TO public USING (bucket_id = 'documents');

CREATE POLICY "Public can delete documents" ON storage.objects
FOR DELETE TO public USING (bucket_id = 'documents');

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'documents';

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects' 
AND policyname LIKE '%documents%';
