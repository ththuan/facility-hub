-- Clean Database Script
-- This script removes duplicate data and resets the database cleanly

-- Clean existing data
DELETE FROM work_orders;
DELETE FROM documents; 
DELETE FROM devices;
DELETE FROM rooms;

-- Reset sequences if needed
-- (PostgreSQL will handle UUID generation automatically)

-- Insert clean sample data
INSERT INTO rooms (code, name, area, capacity, type, floor, building, note) VALUES
('R001', 'Phòng Giám đốc', 25, 1, 'Văn phòng', '3', 'Tòa A', 'Phòng làm việc của giám đốc'),
('R002', 'Phòng kế toán', 20, 3, 'Văn phòng', '2', 'Tòa A', 'Phòng kế toán tổng hợp'),
('R003', 'Phòng họp lớn', 50, 20, 'Phòng họp', '1', 'Tòa A', 'Phòng họp chính');

INSERT INTO devices (code, name, category, unit, status, quantity, room_id) VALUES 
('DEV001', 'Máy tính Dell Inspiron', 'Máy tính', 'Chiếc', 'Tốt', 1, (SELECT id FROM rooms WHERE code = 'R001')),
('DEV002', 'Máy in Canon LBP2900', 'Máy in', 'Chiếc', 'Tốt', 1, (SELECT id FROM rooms WHERE code = 'R002')),
('DEV003', 'Máy chiếu Epson', 'Thiết bị AV', 'Chiếc', 'Tốt', 1, (SELECT id FROM rooms WHERE code = 'R003'));

INSERT INTO documents (title, type, description, file_path, tags, related_device_id) VALUES 
('Hợp đồng mua máy tính Dell', 'contract', 'Hợp đồng mua sắm máy tính Dell Inspiron cho phòng giám đốc', '/documents/contracts/dell-contract-2024.pdf', ARRAY['hợp đồng', 'Dell', 'máy tính'], (SELECT id FROM devices WHERE code = 'DEV001')),
('Manual máy in Canon', 'procedure', 'Hướng dẫn sử dụng và bảo trì máy in Canon LBP2900', '/documents/manuals/canon-manual.pdf', ARRAY['hướng dẫn', 'Canon', 'máy in'], (SELECT id FROM devices WHERE code = 'DEV002')),
('Báo giá bảo trì máy chiếu', 'quote', 'Báo giá dịch vụ bảo trì định kỳ máy chiếu Epson', '/documents/quotes/projector-maintenance-quote.pdf', ARRAY['báo giá', 'bảo trì', 'máy chiếu'], (SELECT id FROM devices WHERE code = 'DEV003'));

INSERT INTO work_orders (title, description, priority, status, assignee, room_id, device_id) VALUES
('Thay bóng đèn máy chiếu', 'Bóng đèn máy chiếu trong phòng họp đã hỏng, cần thay thế', 'med', 'open', 'Nguyễn Văn A', (SELECT id FROM rooms WHERE code = 'R003'), (SELECT id FROM devices WHERE code = 'DEV003')),
('Kiểm tra máy in', 'Máy in có tiếng ồn lạ khi hoạt động', 'low', 'open', 'Lê Thị B', (SELECT id FROM rooms WHERE code = 'R002'), (SELECT id FROM devices WHERE code = 'DEV002'));

-- Verify data
SELECT 'Rooms' as table_name, COUNT(*) as count FROM rooms
UNION ALL
SELECT 'Devices' as table_name, COUNT(*) as count FROM devices  
UNION ALL
SELECT 'Documents' as table_name, COUNT(*) as count FROM documents
UNION ALL
SELECT 'Work Orders' as table_name, COUNT(*) as count FROM work_orders;
