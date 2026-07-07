-- Run this in Supabase SQL Editor to create the required table.
-- The users table is managed by Supabase Auth automatically.

create table if not exists clarity_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  post_text text not null,
  score integer not null check (score >= 0 and score <= 100),
  color text not null,
  color_hex text not null,
  component_scores jsonb not null,
  explanation text,
  created_at timestamptz default now() not null
);

-- Index for fast user+time queries
create index if not exists idx_clarity_scores_user_created
  on clarity_scores (user_id, created_at desc);

-- Row Level Security: users can only read their own scores
alter table clarity_scores enable row level security;

create policy "Users can read own scores"
  on clarity_scores for select
  using (auth.uid() = user_id);

create policy "Users can insert own scores"
  on clarity_scores for insert
  with check (auth.uid() = user_id);
