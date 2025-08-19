-- Facility Hub User Management Schema
-- This script sets up user authentication and authorization tables

-- Create ENUMs for user management
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM('active','inactive','suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    module TEXT NOT NULL,
    actions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    level INTEGER NOT NULL, -- 1 = Admin, 2 = Manager, 3 = Staff, 4 = Viewer
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL, -- Store hashed passwords
    role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
    department TEXT NOT NULL,
    phone TEXT,
    position TEXT,
    avatar TEXT,
    status user_status DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Insert default permissions
INSERT INTO permissions (name, display_name, module, actions) VALUES
-- Dashboard permissions
('dashboard_read', 'Xem Dashboard', 'dashboard', ARRAY['read']),

-- Device permissions
('devices_create', 'Tạo thiết bị', 'devices', ARRAY['create']),
('devices_read', 'Xem thiết bị', 'devices', ARRAY['read']),
('devices_update', 'Sửa thiết bị', 'devices', ARRAY['update']),
('devices_delete', 'Xóa thiết bị', 'devices', ARRAY['delete']),
('devices_import', 'Import thiết bị', 'devices', ARRAY['import']),
('devices_export', 'Export thiết bị', 'devices', ARRAY['export']),

-- Room permissions
('rooms_create', 'Tạo phòng', 'rooms', ARRAY['create']),
('rooms_read', 'Xem phòng', 'rooms', ARRAY['read']),
('rooms_update', 'Sửa phòng', 'rooms', ARRAY['update']),
('rooms_delete', 'Xóa phòng', 'rooms', ARRAY['delete']),
('rooms_import', 'Import phòng', 'rooms', ARRAY['import']),
('rooms_export', 'Export phòng', 'rooms', ARRAY['export']),

-- Work order permissions
('work_orders_create', 'Tạo công việc', 'work_orders', ARRAY['create']),
('work_orders_read', 'Xem công việc', 'work_orders', ARRAY['read']),
('work_orders_update', 'Sửa công việc', 'work_orders', ARRAY['update']),
('work_orders_delete', 'Xóa công việc', 'work_orders', ARRAY['delete']),
('work_orders_assign', 'Phân công việc', 'work_orders', ARRAY['assign']),
('work_orders_approve', 'Duyệt công việc', 'work_orders', ARRAY['approve']),

-- Document permissions
('documents_create', 'Tạo tài liệu', 'documents', ARRAY['create']),
('documents_read', 'Xem tài liệu', 'documents', ARRAY['read']),
('documents_update', 'Sửa tài liệu', 'documents', ARRAY['update']),
('documents_delete', 'Xóa tài liệu', 'documents', ARRAY['delete']),
('documents_download', 'Tải tài liệu', 'documents', ARRAY['download']),

-- Procurement permissions
('procurement_create', 'Tạo đề xuất mua sắm', 'procurement', ARRAY['create']),
('procurement_read', 'Xem mua sắm', 'procurement', ARRAY['read']),
('procurement_update', 'Sửa mua sắm', 'procurement', ARRAY['update']),
('procurement_delete', 'Xóa mua sắm', 'procurement', ARRAY['delete']),
('procurement_approve', 'Duyệt mua sắm', 'procurement', ARRAY['approve']),

-- Calendar permissions
('calendar_create', 'Tạo lịch', 'calendar', ARRAY['create']),
('calendar_read', 'Xem lịch', 'calendar', ARRAY['read']),
('calendar_update', 'Sửa lịch', 'calendar', ARRAY['update']),
('calendar_delete', 'Xóa lịch', 'calendar', ARRAY['delete']),

-- Report permissions
('reports_read', 'Xem báo cáo', 'reports', ARRAY['read']),
('reports_export', 'Export báo cáo', 'reports', ARRAY['export']),

-- User management permissions
('users_create', 'Tạo người dùng', 'users', ARRAY['create']),
('users_read', 'Xem người dùng', 'users', ARRAY['read']),
('users_update', 'Sửa người dùng', 'users', ARRAY['update']),
('users_delete', 'Xóa người dùng', 'users', ARRAY['delete']),

-- Settings permissions
('settings_read', 'Xem cài đặt', 'settings', ARRAY['read']),
('settings_update', 'Sửa cài đặt', 'settings', ARRAY['update'])

ON CONFLICT (name) DO NOTHING;

-- Insert default roles
INSERT INTO roles (name, display_name, level, description) VALUES
('admin', 'Quản trị viên', 1, 'Toàn quyền quản lý hệ thống'),
('manager', 'Quản lý', 2, 'Quản lý phòng ban và nhân viên'),
('staff', 'Nhân viên', 3, 'Thực hiện công việc được giao'),
('viewer', 'Người xem', 4, 'Chỉ được xem thông tin')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to admin role (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Assign permissions to manager role (most permissions except user management)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'manager'
AND p.module NOT IN ('users', 'settings')
ON CONFLICT DO NOTHING;

-- Assign permissions to staff role (basic CRUD operations)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'staff'
AND p.actions && ARRAY['create', 'read', 'update']
AND p.module NOT IN ('users', 'settings', 'procurement')
ON CONFLICT DO NOTHING;

-- Assign permissions to viewer role (only read permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'viewer'
AND p.actions && ARRAY['read']
AND p.module NOT IN ('users', 'settings')
ON CONFLICT DO NOTHING;

-- Create default admin user (password: admin123)
-- Note: In production, use proper password hashing
INSERT INTO users (username, email, full_name, password_hash, role_id, department) 
SELECT 'admin', 'admin@facility-hub.com', 'Quản trị viên hệ thống', 
       '$2b$10$6qc6LbzP.3UF6OipmFcIjeqi.LipUkSutt0oFczJEF1lx1NueDSeq', -- admin123 hashed correctly
       r.id, 'IT'
FROM roles r 
WHERE r.name = 'admin'
AND NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Update timestamps trigger for auth tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_permissions_updated_at ON permissions;
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
        )
    );

CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
        )
    );

-- RLS Policies for roles and permissions (admin only)
CREATE POLICY "Admins can view roles" ON roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
        )
    );

CREATE POLICY "Admins can manage roles" ON roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
        )
    );

CREATE POLICY "Admins can view permissions" ON permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id::text = auth.uid()::text AND r.name = 'admin'
        )
    );

-- Sessions policy
CREATE POLICY "Users can manage their own sessions" ON user_sessions
    FOR ALL USING (user_id::text = auth.uid()::text);

COMMENT ON TABLE users IS 'User accounts for the facility management system';
COMMENT ON TABLE roles IS 'User roles and permission levels';
COMMENT ON TABLE permissions IS 'System permissions for different modules';
COMMENT ON TABLE user_sessions IS 'User login sessions and tokens';
COMMENT ON TABLE role_permissions IS 'Junction table linking roles to permissions';
