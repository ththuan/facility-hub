-- Script setup cơ bản cho Supabase
-- Chạy script này trong SQL Editor của Supabase Dashboard

-- Tạo extensions cần thiết
create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- Tạo ENUMs
do $$ begin
  create type device_status as enum('Tốt','Đang bảo trì','Hư');
exception when duplicate_object then null; end $$;

-- Tạo bảng rooms
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text,
  area text,
  capacity int,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tạo bảng devices
create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null,
  category text,
  unit text,
  image text,
  purchase_year int,
  warranty_until date,
  room_id uuid references rooms(id) on delete set null,
  status device_status default 'Tốt',
  quantity int default 1,
  meta jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tạo bảng procurement_items
create table if not exists procurement_items (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  category text check (category in ('fixed-assets', 'tools-equipment')),
  image text,
  department_request_date date not null,
  department_budget_date date not null,
  requested_value numeric(15,2) not null,
  selection_method text check (selection_method in ('tender', 'quotation', 'direct', 'emergency')),
  actual_payment_value numeric(15,2),
  notes text,
  status text check (status in ('draft', 'requested', 'approved', 'rejected', 'purchased', 'completed')) default 'draft',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  department text not null,
  requested_by text not null,
  approved_by text,
  purchase_date date,
  warranty_period int,
  supplier text,
  specifications text,
  quantity int default 1,
  unit text default 'chiếc',
  budget_year int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tạo function tự động sinh mã thiết bị
create or replace function generate_device_code(device_name text, device_category text default '')
returns text as $$
declare
  code_prefix text;
  base_code text;
  final_code text;
  counter int := 0;
begin
  -- Tạo prefix từ category
  case device_category
    when 'computer' then code_prefix := 'COMP';
    when 'printer' then code_prefix := 'PRIN';
    when 'furniture' then code_prefix := 'FURN';
    when 'network' then code_prefix := 'NETW';
    else code_prefix := 'DEV';
  end case;
  
  -- Tạo base code từ tên device
  base_code := code_prefix || '_' || upper(
    regexp_replace(
      regexp_replace(
        regexp_replace(device_name, '[^a-zA-Z0-9\s]', '', 'g'),
        '\s+', '_', 'g'
      ),
      '[àáạảãâầấậẩẫăằắặẳẵ]', 'A', 'gi'
    )
  );
  
  -- Giới hạn độ dài base code
  if length(base_code) > 20 then
    base_code := substring(base_code, 1, 20);
  end if;
  
  -- Kiểm tra code tồn tại và thêm counter nếu cần
  final_code := base_code;
  while exists (select 1 from devices where code = final_code) loop
    counter := counter + 1;
    final_code := base_code || '_' || lpad(counter::text, 3, '0');
  end loop;
  
  return final_code;
end;
$$ language plpgsql;

-- Tạo trigger tự động sinh mã thiết bị
create or replace function auto_generate_device_code()
returns trigger as $$
begin
  if new.code is null or new.code = '' then
    new.code := generate_device_code(new.name, new.category);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger auto_device_code_trigger
  before insert on devices
  for each row execute procedure auto_generate_device_code();

-- Tạo function updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Tạo triggers cho updated_at
create trigger update_rooms_updated_at before update on rooms
  for each row execute procedure update_updated_at_column();

create trigger update_devices_updated_at before update on devices
  for each row execute procedure update_updated_at_column();

create trigger update_procurement_items_updated_at before update on procurement_items
  for each row execute procedure update_updated_at_column();

-- Bật RLS (Row Level Security)
alter table rooms enable row level security;
alter table devices enable row level security;
alter table procurement_items enable row level security;

-- Tạo policies cho tất cả tables (allow all cho demo)
create policy "Allow all for rooms" on rooms for all 
  using (true) with check (true);

create policy "Allow all for devices" on devices for all 
  using (true) with check (true);

create policy "Allow all for procurement_items" on procurement_items for all 
  using (true) with check (true);

-- Tạo indexes cho performance
create index if not exists idx_devices_code on devices (code);
create index if not exists idx_devices_category on devices (category);
create index if not exists idx_devices_room_id on devices (room_id);
create index if not exists idx_devices_status on devices (status);

create index if not exists idx_procurement_items_status on procurement_items (status);
create index if not exists idx_procurement_items_category on procurement_items (category);
create index if not exists idx_procurement_items_department on procurement_items (department);
create index if not exists idx_procurement_items_budget_year on procurement_items (budget_year);

-- Insert sample data
insert into rooms (code, name, area, capacity) values 
  ('R001', 'Phòng IT', 'Tầng 2', 10),
  ('R002', 'Phòng Kế toán', 'Tầng 1', 8),
  ('R003', 'Phòng Nhân sự', 'Tầng 1', 6),
  ('R004', 'Kho', 'Tầng trệt', 50)
on conflict (code) do nothing;

-- Thông báo hoàn thành
select 'Setup hoàn thành! Database đã sẵn sàng sử dụng.' as status;
