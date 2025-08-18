-- Enable Row Level Security on all tables
alter table rooms enable row level security;
alter table devices enable row level security;
alter table documents enable row level security;
alter table work_orders enable row level security;
alter table maintenance_schedules enable row level security;
alter table tasks enable row level security;
alter table notes enable row level security;
alter table users_profile enable row level security;

-- Policies for authenticated users (basic access)
-- You may want to customize these based on your role requirements

-- Rooms policies
create policy "authenticated_users_read_rooms" on rooms
  for select using (auth.role() = 'authenticated');

create policy "authenticated_users_write_rooms" on rooms
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Devices policies
create policy "authenticated_users_read_devices" on devices
  for select using (auth.role() = 'authenticated');

create policy "authenticated_users_write_devices" on devices
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Documents policies
create policy "authenticated_users_read_documents" on documents
  for select using (auth.role() = 'authenticated');

create policy "authenticated_users_write_documents" on documents
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Work orders policies
create policy "authenticated_users_read_work_orders" on work_orders
  for select using (auth.role() = 'authenticated');

create policy "authenticated_users_write_work_orders" on work_orders
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Maintenance schedules policies
create policy "authenticated_users_read_maintenance_schedules" on maintenance_schedules
  for select using (auth.role() = 'authenticated');

create policy "authenticated_users_write_maintenance_schedules" on maintenance_schedules
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Tasks policies
create policy "authenticated_users_read_tasks" on tasks
  for select using (auth.role() = 'authenticated');

create policy "authenticated_users_write_tasks" on tasks
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Notes policies
create policy "authenticated_users_read_notes" on notes
  for select using (auth.role() = 'authenticated');

create policy "authenticated_users_write_notes" on notes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Users profile policies
create policy "users_read_own_profile" on users_profile
  for select using (auth.uid() = id);

create policy "users_update_own_profile" on users_profile
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "users_insert_own_profile" on users_profile
  for insert with check (auth.uid() = id);

-- Function to handle user profile creation on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users_profile (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

-- Trigger for automatic profile creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
