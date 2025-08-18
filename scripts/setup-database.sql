-- Facilty Hub Database Schema
-- This script sets up the complete database schema for the Facility Management Hub

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMs for better data integrity
DO $$ BEGIN
    CREATE TYPE device_status AS ENUM('Tốt','Đang bảo trì','Hư');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE priority_level AS ENUM('low','med','high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wo_status AS ENUM('open','in_progress','done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE doc_type AS ENUM('contract','quote','handover','procedure','other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Core tables
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    area DECIMAL,
    capacity INTEGER,
    type TEXT,
    floor TEXT,
    building TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT,
    image TEXT, -- URL or path to device image
    purchase_year INTEGER,
    warranty_until DATE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    status device_status DEFAULT 'Tốt',
    quantity INTEGER DEFAULT 1,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type doc_type DEFAULT 'other',
    description TEXT,
    file_path TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    related_room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    related_device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    priority priority_level DEFAULT 'med',
    status wo_status DEFAULT 'open',
    assignee TEXT,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_room_id ON devices(room_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_priority ON work_orders(priority);

-- Insert sample data (only if tables are empty)
INSERT INTO rooms (code, name, area, capacity, type, floor, building, description) 
SELECT 'R001', 'Phòng Giám đốc', 25, 1, 'Văn phòng', '3', 'Tòa A', 'Phòng làm việc của giám đốc'
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE code = 'R001');

INSERT INTO rooms (code, name, area, capacity, type, floor, building, description) 
SELECT 'R002', 'Phòng kế toán', 20, 3, 'Văn phòng', '2', 'Tòa A', 'Phòng kế toán tổng hợp'
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE code = 'R002');

INSERT INTO rooms (code, name, area, capacity, type, floor, building, description) 
SELECT 'R003', 'Phòng họp lớn', 50, 20, 'Phòng họp', '1', 'Tòa A', 'Phòng họp chính'
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE code = 'R003');

INSERT INTO rooms (code, name, area, capacity, type, floor, building, description) 
SELECT 'R004', 'Phòng IT', 15, 2, 'Kỹ thuật', '2', 'Tòa A', 'Phòng công nghệ thông tin'
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE code = 'R004');

INSERT INTO devices (code, name, category, unit, status, quantity, room_id) 
SELECT 'DEV001', 'Máy tính Dell Inspiron', 'Máy tính', 'Chiếc', 'Tốt', 1, r.id
FROM rooms r WHERE r.code = 'R001' AND NOT EXISTS (SELECT 1 FROM devices WHERE code = 'DEV001');

INSERT INTO devices (code, name, category, unit, status, quantity, room_id) 
SELECT 'DEV002', 'Máy in Canon LBP2900', 'Máy in', 'Chiếc', 'Tốt', 1, r.id
FROM rooms r WHERE r.code = 'R002' AND NOT EXISTS (SELECT 1 FROM devices WHERE code = 'DEV002');

INSERT INTO devices (code, name, category, unit, status, quantity, room_id) 
SELECT 'DEV003', 'Máy chiếu Epson', 'Thiết bị AV', 'Chiếc', 'Tốt', 1, r.id
FROM rooms r WHERE r.code = 'R003' AND NOT EXISTS (SELECT 1 FROM devices WHERE code = 'DEV003');

INSERT INTO devices (code, name, category, unit, status, quantity, room_id) 
SELECT 'DEV004', 'Switch mạng 24 port', 'Mạng', 'Chiếc', 'Tốt', 1, r.id
FROM rooms r WHERE r.code = 'R004' AND NOT EXISTS (SELECT 1 FROM devices WHERE code = 'DEV004');

INSERT INTO devices (code, name, category, unit, status, quantity, room_id) 
SELECT 'DEV005', 'UPS APC 1000VA', 'Điện', 'Chiếc', 'Tốt', 2, r.id
FROM rooms r WHERE r.code = 'R004' AND NOT EXISTS (SELECT 1 FROM devices WHERE code = 'DEV005');

INSERT INTO devices (code, name, category, unit, status, quantity, room_id) 
SELECT 'DEV006', 'Máy lạnh Daikin 2HP', 'Điều hòa', 'Chiếc', 'Đang bảo trì', 1, r.id
FROM rooms r WHERE r.code = 'R003' AND NOT EXISTS (SELECT 1 FROM devices WHERE code = 'DEV006');

INSERT INTO documents (title, type, description, file_path, tags, related_device_id) 
SELECT 'Hợp đồng mua máy tính Dell', 'contract', 'Hợp đồng mua sắm máy tính Dell Inspiron cho phòng giám đốc', '/documents/contracts/dell-contract-2024.pdf', ARRAY['hợp đồng', 'Dell', 'máy tính'], d.id
FROM devices d WHERE d.code = 'DEV001' AND NOT EXISTS (SELECT 1 FROM documents WHERE title = 'Hợp đồng mua máy tính Dell');

INSERT INTO documents (title, type, description, file_path, tags, related_device_id) 
SELECT 'Manual máy in Canon', 'procedure', 'Hướng dẫn sử dụng và bảo trì máy in Canon LBP2900', '/documents/manuals/canon-manual.pdf', ARRAY['hướng dẫn', 'Canon', 'máy in'], d.id
FROM devices d WHERE d.code = 'DEV002' AND NOT EXISTS (SELECT 1 FROM documents WHERE title = 'Manual máy in Canon');

INSERT INTO documents (title, type, description, file_path, tags, related_device_id) 
SELECT 'Báo giá bảo trì máy chiếu', 'quote', 'Báo giá dịch vụ bảo trì định kỳ máy chiếu Epson', '/documents/quotes/projector-maintenance-quote.pdf', ARRAY['báo giá', 'bảo trì', 'máy chiếu'], d.id
FROM devices d WHERE d.code = 'DEV003' AND NOT EXISTS (SELECT 1 FROM documents WHERE title = 'Báo giá bảo trì máy chiếu');

INSERT INTO work_orders (title, description, priority, status, assignee, room_id, device_id) 
SELECT 'Thay bóng đèn máy chiếu', 'Bóng đèn máy chiếu trong phòng họp đã hỏng, cần thay thế', 'med', 'open', 'Nguyễn Văn A', r.id, d.id
FROM rooms r, devices d WHERE r.code = 'R003' AND d.code = 'DEV003' AND NOT EXISTS (SELECT 1 FROM work_orders WHERE title = 'Thay bóng đèn máy chiếu');

INSERT INTO work_orders (title, description, priority, status, assignee, room_id, device_id) 
SELECT 'Kiểm tra máy in', 'Máy in có tiếng ồn lạ khi hoạt động', 'low', 'open', 'Lê Thị B', r.id, d.id
FROM rooms r, devices d WHERE r.code = 'R002' AND d.code = 'DEV002' AND NOT EXISTS (SELECT 1 FROM work_orders WHERE title = 'Kiểm tra máy in');

INSERT INTO work_orders (title, description, priority, status, assignee, room_id, device_id) 
SELECT 'Bảo trì máy lạnh', 'Bảo trì định kỳ máy lạnh phòng họp', 'high', 'in_progress', 'Trần Văn C', r.id, d.id
FROM rooms r, devices d WHERE r.code = 'R003' AND d.code = 'DEV006' AND NOT EXISTS (SELECT 1 FROM work_orders WHERE title = 'Bảo trì máy lạnh');

INSERT INTO work_orders (title, description, priority, status, assignee, room_id, device_id) 
SELECT 'Cập nhật firmware switch', 'Cập nhật firmware cho switch mạng', 'med', 'done', 'Nguyễn Văn D', r.id, d.id
FROM rooms r, devices d WHERE r.code = 'R004' AND d.code = 'DEV004' AND NOT EXISTS (SELECT 1 FROM work_orders WHERE title = 'Cập nhật firmware switch');

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to all tables
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_devices_updated_at ON devices;
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_work_orders_updated_at ON work_orders;
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
