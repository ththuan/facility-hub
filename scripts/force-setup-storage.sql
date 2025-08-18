-- Force setup storage bucket and policies
-- This script will clean up and recreate everything

-- Clean up existing policies
DELETE FROM storage.policies WHERE bucket_id = 'documents';

-- Drop bucket if exists
DELETE FROM storage.buckets WHERE id = 'documents';

-- Create documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    true,
    52428800, -- 50MB limit
    ARRAY['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO UPDATE SET
    name = 'documents',
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

-- Create comprehensive policy for all operations
INSERT INTO storage.policies (id, bucket_id, role, operation, definition, check_definition)
VALUES (
    'documents_all_operations',
    'documents',
    'public',
    'SELECT',
    'true',
    'true'
),
(
    'documents_all_insert',
    'documents',
    'public', 
    'INSERT',
    'true',
    'true'
),
(
    'documents_all_update',
    'documents',
    'public',
    'UPDATE', 
    'true',
    'true'
),
(
    'documents_all_delete',
    'documents',
    'public',
    'DELETE',
    'true',
    'true'
)
ON CONFLICT (id) DO UPDATE SET
    definition = EXCLUDED.definition,
    check_definition = EXCLUDED.check_definition;

-- Verify bucket exists
SELECT 
    id,
    name, 
    public,
    file_size_limit,
    created_at
FROM storage.buckets 
WHERE id = 'documents';

-- Verify policies
SELECT 
    id,
    bucket_id,
    operation,
    definition
FROM storage.policies 
WHERE bucket_id = 'documents';

-- Test bucket accessibility
SELECT 
    EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'documents' AND public = true) as bucket_ready,
    COUNT(*) as policy_count
FROM storage.policies 
WHERE bucket_id = 'documents';
