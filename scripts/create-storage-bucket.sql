-- CREATE STORAGE BUCKET AND POLICIES
-- Chạy script này trong Supabase SQL Editor

-- 1. Tạo bucket 'documents' (nếu chưa có)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents', 
    true,
    52428800, -- 50MB
    ARRAY[
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- 2. Xóa các policy cũ để tránh conflict
DELETE FROM storage.policies WHERE bucket_id = 'documents';

-- 3. Tạo policy cho phép upload, download, delete cho tất cả user
INSERT INTO storage.policies (id, bucket_id, role, operation, definition, check_definition)
VALUES
    (
        'documents_public_read',
        'documents',
        'public',
        'SELECT', 
        'true',
        'true'
    ),
    (
        'documents_public_insert',
        'documents', 
        'public',
        'INSERT',
        'true',
        'true'
    ),
    (
        'documents_public_update',
        'documents',
        'public', 
        'UPDATE',
        'true',
        'true'
    ),
    (
        'documents_public_delete',
        'documents',
        'public',
        'DELETE',
        'true', 
        'true'
    );

-- 4. Kiểm tra kết quả
SELECT 
    'Bucket created:' as status,
    id,
    name,
    public,
    file_size_limit,
    created_at
FROM storage.buckets 
WHERE id = 'documents';

SELECT 
    'Policies created:' as status,
    id,
    operation,
    role
FROM storage.policies 
WHERE bucket_id = 'documents';
