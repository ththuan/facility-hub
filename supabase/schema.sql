-- Extensions
create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- ENUMs
do $$ begin
  create type device_status as enum('Tốt','Đang bảo trì','Hư');
  create type priority_level as enum('low','med','high');
  create type wo_status as enum('open','in_progress','done');
  create type doc_type as enum('contract','quote','handover','procedure','other');
  create type task_status as enum('todo','doing','done');
  create type user_role as enum('owner','editor','viewer');
  create type period_type as enum('monthly','quarterly','yearly');
exception when duplicate_object then null; end $$;

-- Core tables
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

create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null,
  category text,
  unit text,
  image text, -- URL or path to device image
  purchase_year int,
  warranty_until date,
  room_id uuid references rooms(id) on delete set null,
  status device_status default 'Tốt',
  quantity int default 1,
  meta jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type doc_type,
  file_path text not null, -- Supabase Storage path
  tags text[] default '{}',
  related_room_id uuid references rooms(id) on delete set null,
  related_device_id uuid references devices(id) on delete set null,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists work_orders (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  room_id uuid references rooms(id) on delete set null,
  device_id uuid references devices(id) on delete set null,
  priority priority_level default 'med',
  status wo_status default 'open',
  assignee text,
  due_date date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists maintenance_schedules (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete set null,
  device_id uuid references devices(id) on delete set null,
  period period_type not null,
  next_date date not null,
  last_date date,
  checklist jsonb default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status task_status default 'todo',
  due_date date,
  priority priority_level default 'med',
  assignee text,
  linked_work_order_id uuid references work_orders(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  title text,
  content_md text,
  tags text[] default '{}',
  linked_room_id uuid references rooms(id) on delete set null,
  linked_device_id uuid references devices(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  role user_role default 'owner',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Full-text search
alter table devices add column if not exists search_vector tsvector
  generated always as (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(category,'') || ' ' || coalesce(code,''))) stored;

alter table rooms add column if not exists search_vector tsvector
  generated always as (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(code,'') || ' ' || coalesce(area,''))) stored;

alter table documents add column if not exists search_vector tsvector
  generated always as (to_tsvector('simple', coalesce(title,'') || ' ' || array_to_string(tags, ' '))) stored;

alter table notes add column if not exists search_vector tsvector
  generated always as (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content_md,'') || ' ' || array_to_string(tags, ' '))) stored;

-- Indexes
create index if not exists idx_devices_fts on devices using gin (search_vector);
create index if not exists idx_devices_trgm on devices using gin (name gin_trgm_ops);
create index if not exists idx_devices_room_id on devices (room_id);
create index if not exists idx_devices_status on devices (status);

create index if not exists idx_rooms_fts on rooms using gin (search_vector);
create index if not exists idx_rooms_code on rooms (code);

create index if not exists idx_documents_fts on documents using gin (search_vector);
create index if not exists idx_documents_type on documents (type);
create index if not exists idx_documents_room_id on documents (related_room_id);
create index if not exists idx_documents_device_id on documents (related_device_id);

create index if not exists idx_notes_fts on notes using gin (search_vector);
create index if not exists idx_notes_room_id on notes (linked_room_id);
create index if not exists idx_notes_device_id on notes (linked_device_id);

create index if not exists idx_work_orders_status on work_orders (status);
create index if not exists idx_work_orders_priority on work_orders (priority);
create index if not exists idx_work_orders_due_date on work_orders (due_date);

create index if not exists idx_tasks_status on tasks (status);
create index if not exists idx_tasks_due_date on tasks (due_date);

create index if not exists idx_maintenance_schedules_next_date on maintenance_schedules (next_date);

-- Triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_rooms_updated_at before update on rooms
  for each row execute procedure update_updated_at_column();

create trigger update_devices_updated_at before update on devices
  for each row execute procedure update_updated_at_column();

create trigger update_documents_updated_at before update on documents
  for each row execute procedure update_updated_at_column();

create trigger update_work_orders_updated_at before update on work_orders
  for each row execute procedure update_updated_at_column();

create trigger update_maintenance_schedules_updated_at before update on maintenance_schedules
  for each row execute procedure update_updated_at_column();

create trigger update_tasks_updated_at before update on tasks
  for each row execute procedure update_updated_at_column();

create trigger update_notes_updated_at before update on notes
  for each row execute procedure update_updated_at_column();

create trigger update_users_profile_updated_at before update on users_profile
  for each row execute procedure update_updated_at_column();

-- Function to generate device code from device name
create or replace function generate_device_code(device_name text, category text default null)
returns text as $$
declare
  code_prefix text;
  base_code text;
  counter int := 1;
  final_code text;
begin
  -- Create prefix based on category
  if category is not null then
    case lower(category)
      when 'máy tính' then code_prefix := 'MT';
      when 'máy in' then code_prefix := 'MI';
      when 'điều hòa' then code_prefix := 'DH';
      when 'bàn ghế' then code_prefix := 'BG';
      when 'tủ' then code_prefix := 'TU';
      when 'máy photocopy' then code_prefix := 'PC';
      when 'máy chiếu' then code_prefix := 'MC';
      when 'tivi' then code_prefix := 'TV';
      when 'tủ lạnh' then code_prefix := 'TL';
      when 'quạt' then code_prefix := 'QT';
      else code_prefix := 'TB'; -- Thiết bị chung
    end case;
  else
    code_prefix := 'TB';
  end if;
  
  -- Create base code from device name
  base_code := code_prefix || '_' || upper(
    regexp_replace(
      regexp_replace(
        regexp_replace(device_name, '[^a-zA-Z0-9\s]', '', 'g'),
        '\s+', '_', 'g'
      ),
      '[àáạảãâầấậẩẫăằắặẳẵ]', 'A', 'gi'
    )
  );
  
  -- Limit base code length
  if length(base_code) > 20 then
    base_code := substring(base_code, 1, 20);
  end if;
  
  -- Check if code exists and add counter if needed
  final_code := base_code;
  while exists (select 1 from devices where code = final_code) loop
    counter := counter + 1;
    final_code := base_code || '_' || lpad(counter::text, 3, '0');
  end loop;
  
  return final_code;
end;
$$ language plpgsql;

-- Trigger to auto-generate device code
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

-- Procurement items table
create table if not exists procurement_items (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  category text check (category in ('fixed-assets', 'tools-equipment')),
  image text, -- URL or path to item image
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
  warranty_period int, -- months
  supplier text,
  specifications text,
  quantity int default 1,
  unit text default 'chiếc',
  budget_year int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for procurement_items
alter table procurement_items enable row level security;

create policy "Allow all for procurement_items" on procurement_items for all 
  using (true) with check (true);

-- Indexes for procurement_items
create index if not exists idx_procurement_items_status on procurement_items (status);
create index if not exists idx_procurement_items_category on procurement_items (category);
create index if not exists idx_procurement_items_department on procurement_items (department);
create index if not exists idx_procurement_items_budget_year on procurement_items (budget_year);

-- Updated at trigger for procurement_items
create trigger update_procurement_items_updated_at before update on procurement_items
  for each row execute procedure update_updated_at_column();
