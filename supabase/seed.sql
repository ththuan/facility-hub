-- Sample data for testing
-- Insert sample rooms
insert into rooms (code, name, area, capacity, note) values
  ('R001', 'Phòng Giám đốc', 'Tầng 3', 1, 'Phòng làm việc của giám đốc'),
  ('R002', 'Phòng Kế toán', 'Tầng 2', 5, 'Phòng kế toán và tài chính'),
  ('R003', 'Phòng IT', 'Tầng 1', 8, 'Phòng công nghệ thông tin'),
  ('R004', 'Phòng họp lớn', 'Tầng 2', 20, 'Phòng họp chính'),
  ('R005', 'Kho thiết bị', 'Tầng 1', 0, 'Kho lưu trữ thiết bị');

-- Insert sample devices
insert into devices (code, name, category, unit, purchase_year, warranty_until, room_id, status, quantity) values
  ('DEV001', 'Máy tính để bàn Dell OptiPlex', 'Máy tính', 'Chiếc', 2023, '2026-01-01', (select id from rooms where code = 'R001'), 'Tốt', 1),
  ('DEV002', 'Máy in HP LaserJet', 'Thiết bị văn phòng', 'Chiếc', 2022, '2025-06-01', (select id from rooms where code = 'R002'), 'Tốt', 1),
  ('DEV003', 'Máy chiếu Epson', 'Thiết bị trình chiếu', 'Chiếc', 2021, '2024-12-01', (select id from rooms where code = 'R004'), 'Đang bảo trì', 1),
  ('DEV004', 'Laptop Lenovo ThinkPad', 'Máy tính', 'Chiếc', 2023, '2026-03-01', (select id from rooms where code = 'R003'), 'Tốt', 5),
  ('DEV005', 'Máy lạnh Daikin 2HP', 'Điều hòa', 'Chiếc', 2020, '2023-08-01', (select id from rooms where code = 'R004'), 'Hư', 1),
  ('DEV006', 'Bàn làm việc gỗ', 'Nội thất', 'Chiếc', 2022, null, (select id from rooms where code = 'R003'), 'Tốt', 8),
  ('DEV007', 'Ghế xoay văn phòng', 'Nội thất', 'Chiếc', 2022, null, (select id from rooms where code = 'R003'), 'Tốt', 8);

-- Insert sample work orders
insert into work_orders (title, description, device_id, priority, status, assignee, due_date) values
  ('Bảo trì máy chiếu phòng họp', 'Máy chiếu bị mờ hình, cần vệ sinh và thay bóng đèn', (select id from devices where code = 'DEV003'), 'high', 'in_progress', 'Nguyễn Văn A', '2024-08-20'),
  ('Sửa chữa máy lạnh phòng họp', 'Máy lạnh không lạnh, nghi ngờ hết gas', (select id from devices where code = 'DEV005'), 'high', 'open', 'Trần Văn B', '2024-08-18'),
  ('Kiểm tra máy in phòng kế toán', 'Máy in có tiếng ồn bất thường', (select id from devices where code = 'DEV002'), 'med', 'open', 'Lê Thị C', '2024-08-25');

-- Insert sample tasks
insert into tasks (title, status, due_date, priority, assignee, linked_work_order_id) values
  ('Mua bóng đèn máy chiếu', 'done', '2024-08-16', 'med', 'Nguyễn Văn A', (select id from work_orders where title = 'Bảo trì máy chiếu phòng họp')),
  ('Vệ sinh máy chiếu', 'doing', '2024-08-17', 'med', 'Nguyễn Văn A', (select id from work_orders where title = 'Bảo trì máy chiếu phòng họp')),
  ('Liên hệ thợ sửa máy lạnh', 'todo', '2024-08-18', 'high', 'Trần Văn B', (select id from work_orders where title = 'Sửa chữa máy lạnh phòng họp'));

-- Insert sample maintenance schedules
insert into maintenance_schedules (device_id, period, next_date, last_date, checklist) values
  ((select id from devices where code = 'DEV001'), 'quarterly', '2024-11-01', '2024-08-01', '{"items": ["Vệ sinh máy tính", "Kiểm tra phần mềm", "Cập nhật driver"]}'),
  ((select id from devices where code = 'DEV002'), 'monthly', '2024-09-01', '2024-08-01', '{"items": ["Thay mực in", "Vệ sinh máy in", "Kiểm tra chất lượng in"]}'),
  ((select id from devices where code = 'DEV005'), 'quarterly', '2024-11-01', '2024-05-01', '{"items": ["Vệ sinh máy lạnh", "Kiểm tra gas", "Thay filter"]}');

-- Insert sample notes
insert into notes (title, content_md, tags, linked_device_id) values
  ('Hướng dẫn sử dụng máy chiếu', '## Cách sử dụng máy chiếu Epson\n\n1. Bật nguồn điện\n2. Kết nối HDMI\n3. Chọn source\n4. Điều chỉnh focus', '{"hướng dẫn", "máy chiếu"}', (select id from devices where code = 'DEV003')),
  ('Lịch sử sửa chữa máy lạnh', '## Lịch sử bảo trì\n\n- **2024-05-01**: Vệ sinh và thay filter\n- **2024-02-01**: Nạp gas R32\n- **2023-11-01**: Thay cánh quạt', '{"lịch sử", "bảo trì"}', (select id from devices where code = 'DEV005'));

-- Insert sample documents (placeholder file paths)
insert into documents (title, type, file_path, tags, related_device_id) values
  ('Hợp đồng mua máy tính Dell', 'contract', 'docs/2023/contracts/dell-contract.pdf', '{"hợp đồng", "Dell"}', (select id from devices where code = 'DEV001')),
  ('Sổ tay bảo hành máy in HP', 'handover', 'docs/2022/manuals/hp-warranty.pdf', '{"bảo hành", "HP"}', (select id from devices where code = 'DEV002')),
  ('Báo giá sửa chữa máy lạnh', 'quote', 'docs/2024/quotes/ac-repair-quote.pdf', '{"báo giá", "sửa chữa"}', (select id from devices where code = 'DEV005'));
