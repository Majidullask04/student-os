-- ==============================================================================
-- Student OS — Supabase Production Database Schema
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Student Profiles Table (Linked 1:1 with Supabase Auth users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    name text not null default 'Student',
    goal text default 'AI Engineer',
    target_role text default 'AI Engineer',
    level text default 'Intermediate',
    time_commitment_hours integer default 2,
    interests text[] default array['AI', 'DevOps', 'Full Stack'],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Automatic trigger to create profile upon Supabase signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Student Skills Table
create table if not exists public.student_skills (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    category text default 'General',
    proficiency integer default 50, -- 0 to 100
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Personalized Roadmaps Table
create table if not exists public.roadmaps (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    goal text not null,
    target_role text not null,
    overall_percentage integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Roadmap Stages & Modules Table
create table if not exists public.roadmap_modules (
    id uuid primary key default uuid_generate_v4(),
    roadmap_id uuid references public.roadmaps(id) on delete cascade not null,
    stage_number integer not null,
    title text not null,
    description text,
    status text default 'Upcoming', -- 'Completed', 'In Progress', 'Upcoming'
    total_tasks integer default 0,
    completed_tasks integer default 0,
    percentage integer default 0,
    why_this_step text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Roadmap Tasks Table
create table if not exists public.roadmap_tasks (
    id uuid primary key default uuid_generate_v4(),
    module_id uuid references public.roadmap_modules(id) on delete cascade not null,
    title text not null,
    description text,
    task_type text default 'Theory', -- 'Theory', 'Hands-on', 'Project', 'Security'
    task_level text default 'Core',
    estimated_hours numeric default 2.0,
    completed boolean default false,
    in_progress boolean default false,
    dependencies text[] default array[]::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Roadmap Sub-Tasks Table
create table if not exists public.roadmap_subtasks (
    id uuid primary key default uuid_generate_v4(),
    task_id uuid references public.roadmap_tasks(id) on delete cascade not null,
    title text not null,
    completed boolean default false
);

-- 8. Curated Learning Resources Table
create table if not exists public.resources (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    platform text not null, -- 'YouTube Video', 'Course', 'Article', 'GitHub Repository'
    creator text not null,
    thumbnail_url text,
    category text not null,
    tags text[] default array[]::text[],
    difficulty text default 'Beginner',
    duration text default '1h',
    url text not null,
    rating numeric default 4.8,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Saved / Bookmarked Resources Table
create table if not exists public.saved_resources (
    user_id uuid references public.profiles(id) on delete cascade not null,
    resource_id uuid references public.resources(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, resource_id)
);

-- 10. Creators Table
create table if not exists public.creators (
    id text primary key, -- slug (e.g. 'karpathy')
    name text not null,
    handle text not null,
    avatar_url text,
    verified boolean default true,
    followers text,
    platform text default 'YouTube',
    bio text,
    tags text[] default array[]::text[],
    featured_series text[] default array[]::text[],
    why_relevant text,
    roadmap_coverage jsonb default '{}'::jsonb
);

-- 11. Followed Creators Table
create table if not exists public.followed_creators (
    user_id uuid references public.profiles(id) on delete cascade not null,
    creator_id text references public.creators(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, creator_id)
);

-- 12. Jobs Catalog Table
create table if not exists public.jobs (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    company text not null,
    company_logo text,
    location text default 'Remote',
    job_type text default 'Full-time',
    experience text default '0-2 years',
    salary text default '$110,000 - $135,000',
    skills_required text[] default array[]::text[],
    description text,
    apply_url text
);

-- 13. Agent Memory Table (Long-term contextual assistant conversations)
create table if not exists public.agent_memory (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    role text not null, -- 'user', 'assistant', 'system'
    content text not null,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- Ensures each authenticated student can only access and modify their own data
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.student_skills enable row level security;
alter table public.roadmaps enable row level security;
alter table public.roadmap_modules enable row level security;
alter table public.roadmap_tasks enable row level security;
alter table public.roadmap_subtasks enable row level security;
alter table public.saved_resources enable row level security;
alter table public.followed_creators enable row level security;
alter table public.agent_memory enable row level security;

-- Profiles: user can read/write own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Skills: user can CRUD own skills
create policy "Users can CRUD own skills" on public.student_skills for all using (auth.uid() = user_id);

-- Roadmaps: user can CRUD own roadmaps
create policy "Users can CRUD own roadmaps" on public.roadmaps for all using (auth.uid() = user_id);

-- Resources & Creators: publicly readable by authenticated users
alter table public.resources enable row level security;
alter table public.creators enable row level security;
alter table public.jobs enable row level security;
create policy "Resources are readable by all" on public.resources for select to authenticated, anon using (true);
create policy "Creators are readable by all" on public.creators for select to authenticated, anon using (true);
create policy "Jobs are readable by all" on public.jobs for select to authenticated, anon using (true);

-- Saved resources & followed creators
create policy "Users can manage saved resources" on public.saved_resources for all using (auth.uid() = user_id);
create policy "Users can manage followed creators" on public.followed_creators for all using (auth.uid() = user_id);

-- Agent memory
create policy "Users can manage own agent memory" on public.agent_memory for all using (auth.uid() = user_id);
