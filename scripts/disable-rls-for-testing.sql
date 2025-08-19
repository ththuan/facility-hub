-- Temporarily disable RLS for testing
-- WARNING: This is for debugging only, re-enable after testing

-- Disable RLS on auth tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;  
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;

-- Check if admin user exists
SELECT 'Admin user check:' as step;
SELECT username, email, full_name, status, password_hash
FROM users 
WHERE username = 'admin';

-- Check if roles exist
SELECT 'Roles check:' as step;
SELECT name, display_name, level FROM roles ORDER BY level;

-- Test login manually
SELECT 'Manual login test:' as step;
SELECT 
    u.id,
    u.username, 
    u.email,
    u.full_name,
    u.status,
    r.name as role_name,
    r.display_name as role_display_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.username = 'admin' AND u.status = 'active';
