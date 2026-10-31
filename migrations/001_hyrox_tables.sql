-- HYROX Program tables
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Profile: race config, HR/pace inputs, equipment
create table if not exists hyrox_profile (
  id uuid primary key default gen_random_uuid(),
  race_date date not null,
  division text,
  birth_year int,
  max_hr int,
  resting_hr int,
  run_5k_seconds int,
  row_2k_seconds int,
  ski_2k_seconds int,
  goal_race_seconds int,
  equipment jsonb default '{"sled":false,"skierg":false,"rower":false,"bike":false,"wall_ball":false}'::jsonb,
  pace_multipliers jsonb default '{}'::jsonb,
  days_per_week int default 6,
  updated_at timestamptz default now()
);

-- Benchmarks: test results that drive target recalculation
create table if not exists hyrox_benchmarks (
  id uuid primary key default gen_random_uuid(),
  test_type text not null,
  date_local date not null,
  result_value numeric,
  result_unit text,
  details jsonb,
  cardio_session_id uuid,
  created_at timestamptz default now()
);

-- Planned sessions: the generated program
create table if not exists hyrox_planned_sessions (
  id uuid primary key default gen_random_uuid(),
  date_local date not null,
  week_index int,
  phase text,
  template_id text,
  resolved jsonb,
  status text default 'planned',
  workout_session_id uuid,
  cardio_session_id uuid,
  rpe int,
  notes text,
  grade jsonb,
  unique (date_local, template_id)
);

-- Add hr_zone_seconds and planned_session_id to cardio_sessions
alter table cardio_sessions
  add column if not exists hr_zone_seconds jsonb,
  add column if not exists hr_samples jsonb,
  add column if not exists planned_session_id uuid;

-- RLS policies (single-user, match existing pattern)
alter table hyrox_profile enable row level security;
alter table hyrox_benchmarks enable row level security;
alter table hyrox_planned_sessions enable row level security;

create policy "anon_all_hyrox_profile" on hyrox_profile for all using (true) with check (true);
create policy "anon_all_hyrox_benchmarks" on hyrox_benchmarks for all using (true) with check (true);
create policy "anon_all_hyrox_planned_sessions" on hyrox_planned_sessions for all using (true) with check (true);
