create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;
alter table public.tasks enable row level security;

create policy "Users can view own notes"
  on public.notes for select using (auth.uid() = user_id);
create policy "Users can insert own notes"
  on public.notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes"
  on public.notes for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users can delete own notes"
  on public.notes for delete using (auth.uid() = user_id);

create policy "Users can view own tasks"
  on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks"
  on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks"
  on public.tasks for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users can delete own tasks"
  on public.tasks for delete using (auth.uid() = user_id);