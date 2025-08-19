-- Fix admin password hash
-- This script updates the admin user password hash to the correct value

UPDATE users 
SET password_hash = '$2b$10$6qc6LbzP.3UF6OipmFcIjeqi.LipUkSutt0oFczJEF1lx1NueDSeq'
WHERE username = 'admin';

-- Verify the update
SELECT username, email, full_name, 
       LEFT(password_hash, 20) || '...' as password_hash_preview
FROM users 
WHERE username = 'admin';
