-- Supabase schema for traveler profiles, experiences, and tour ratings.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  country text,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  summary text,
  content text not null,
  rating int check (rating between 1 and 5),
  tour_id text,
  trip_month text,
  created_at timestamptz default now()
);

create table if not exists public.tour_ratings (
  id uuid primary key default gen_random_uuid(),
  tour_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (tour_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.experiences enable row level security;
alter table public.tour_ratings enable row level security;

create policy "Profiles are readable by everyone"
  on public.profiles
  for select
  using (true);

create policy "Profiles are owned by the user"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Profiles can be updated by the user"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Experiences are readable by everyone"
  on public.experiences
  for select
  using (true);

create policy "Users can create experiences"
  on public.experiences
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their experiences"
  on public.experiences
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their experiences"
  on public.experiences
  for delete
  using (auth.uid() = user_id);

create policy "Ratings are readable by everyone"
  on public.tour_ratings
  for select
  using (true);

create policy "Users can rate tours"
  on public.tour_ratings
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their rating"
  on public.tour_ratings
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their rating"
  on public.tour_ratings
  for delete
  using (auth.uid() = user_id);

-- Storage bucket for avatar uploads
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

create policy "Avatar images are publicly accessible"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects
  for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects
  for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects
  for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
