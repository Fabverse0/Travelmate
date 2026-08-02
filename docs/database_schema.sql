-- =========================================
-- TravelMate Database Schema
-- Sesuai PRD_TravelMate.md
-- =========================================

-- =========================================
-- 1. user_preferences
-- =========================================
create table user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  traveler_type text check (traveler_type in ('backpacker','family','honeymoon','kuliner','umum')) default 'umum',
  budget_range text check (budget_range in ('hemat','menengah','mewah')) default 'menengah',
  food_pref text,               -- contoh: "pedas", "tidak pedas", "vegetarian"
  language_style text check (language_style in ('formal','santai')) default 'santai',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- =========================================
-- 2. trips
-- =========================================
create table trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,              -- contoh: "Liburan Jogja 3 Hari"
  destination text not null,
  total_budget numeric,
  start_date date,
  end_date date,
  status text check (status in ('draft','final')) default 'draft',
  created_at timestamptz default now()
);

-- =========================================
-- 3. trip_days
-- =========================================
create table trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  day_number int not null,
  date date,
  unique(trip_id, day_number)
);

-- =========================================
-- 4. trip_activities
-- =========================================
create table trip_activities (
  id uuid primary key default gen_random_uuid(),
  trip_day_id uuid not null references trip_days(id) on delete cascade,
  sequence int not null,            -- urutan aktivitas dalam hari itu
  time text,                        -- contoh: "09:00"
  location_name text not null,
  activity_description text,
  estimated_cost numeric default 0,
  latitude numeric,
  longitude numeric,
  created_at timestamptz default now()
);

-- =========================================
-- 5. chat_messages
-- =========================================
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  trip_id uuid references trips(id) on delete set null,  -- nullable, diisi jika pesan terkait trip tertentu
  created_at timestamptz default now()
);

-- =========================================
-- 6. Row Level Security (RLS) — WAJIB diaktifkan
-- =========================================
alter table user_preferences enable row level security;
alter table chat_messages enable row level security;
alter table trips enable row level security;
alter table trip_days enable row level security;
alter table trip_activities enable row level security;

-- =========================================
-- 7. Policies
-- =========================================

-- Policy untuk trips
create policy "Users can CRUD their own trips"
  on trips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy untuk user_preferences
create policy "Users can CRUD their own preferences"
  on user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy untuk chat_messages
create policy "Users can CRUD their own chat messages"
  on chat_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy untuk trip_days (via join ke trips)
create policy "Users can access trip_days of their own trips"
  on trip_days for all
  using (exists (select 1 from trips where trips.id = trip_days.trip_id and trips.user_id = auth.uid()))
  with check (exists (select 1 from trips where trips.id = trip_days.trip_id and trips.user_id = auth.uid()));

-- Policy untuk trip_activities (via join ke trip_days dan trips)
create policy "Users can access trip_activities of their own trips"
  on trip_activities for all
  using (exists (
    select 1 from trip_days
    join trips on trips.id = trip_days.trip_id
    where trip_days.id = trip_activities.trip_day_id and trips.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from trip_days
    join trips on trips.id = trip_days.trip_id
    where trip_days.id = trip_activities.trip_day_id and trips.user_id = auth.uid()
  ));

-- =========================================
-- 8. Indexes untuk performa
-- =========================================
create index idx_trips_user_id on trips(user_id);
create index idx_trips_created_at on trips(created_at desc);
create index idx_trip_days_trip_id on trip_days(trip_id);
create index idx_trip_activities_trip_day_id on trip_activities(trip_day_id);
create index idx_chat_messages_user_id on chat_messages(user_id);
create index idx_chat_messages_created_at on chat_messages(created_at desc);
create index idx_user_preferences_user_id on user_preferences(user_id);

-- =========================================
-- 9. Function untuk updated_at otomatis
-- =========================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_user_preferences_updated_at
  before update on user_preferences
  for each row
  execute function update_updated_at_column();