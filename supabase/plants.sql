-- Hypothetical plants table for Pompom
-- Run in Supabase SQL editor when ready.

create table if not exists public.plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  x_position double precision not null default 0,
  y_position double precision not null default 0,
  growth_stage integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.plants enable row level security;

create policy "Users can view own plants"
  on public.plants for select
  using (auth.uid() = user_id);

create policy "Users can insert own plants"
  on public.plants for insert
  with check (auth.uid() = user_id);

create policy "Users can update own plants"
  on public.plants for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own plants"
  on public.plants for delete
  using (auth.uid() = user_id);
