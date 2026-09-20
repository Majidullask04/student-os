-- ==============================================================================
-- Student OS — Schema v2 (Production Delta)
-- Run AFTER schema.sql in Supabase SQL Editor.
-- Adds: pgvector RAG, conversations, academic, applications, community,
--       bookmarks, notifications, agent observability, audit logs.
-- ==============================================================================

create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- RAG / KNOWLEDGE (§11, §12, §38)
-- ---------------------------------------------------------------------------
create table if not exists public.resource_chunks (
    id uuid primary key default uuid_generate_v4(),
    resource_id uuid references public.resources(id) on delete cascade,
    content text not null,
    embedding vector(768),
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index if not exists resource_chunks_embedding_idx
    on public.resource_chunks using hnsw (embedding vector_cosine_ops);

create table if not exists public.documents (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    source_type text default 'upload',      -- upload | creator | job | note
    source_url text,
    file_path text,                          -- S3 key, not binary in PG
    status text default 'pending',           -- pending | processing | ready | failed
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.document_chunks (
    id uuid primary key default uuid_generate_v4(),
    document_id uuid references public.documents(id) on delete cascade not null,
    content text not null,
    embedding vector(768),
    chunk_index integer default 0,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index if not exists document_chunks_embedding_idx
    on public.document_chunks using hnsw (embedding vector_cosine_ops);

-- ---------------------------------------------------------------------------
-- CONVERSATIONS (proper chat history, §37)
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text default 'New conversation',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.messages (
    id uuid primary key default uuid_generate_v4(),
    conversation_id uuid references public.conversations(id) on delete cascade not null,
    role text not null,                      -- user | assistant | system | tool
    content text not null,
    tool_calls jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------------
-- ACADEMIC ENGINE (§27)
-- ---------------------------------------------------------------------------
create table if not exists public.subjects (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    semester integer default 1,
    credits numeric default 4.0,
    current_grade text,
    progress integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.academic_events (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    event_type text default 'exam',          -- exam | assignment | deadline
    subject_id uuid references public.subjects(id) on delete set null,
    event_date timestamp with time zone not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------------
-- CAREER (§24, §25)
-- ---------------------------------------------------------------------------
create table if not exists public.job_matches (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    job_id uuid references public.jobs(id) on delete cascade not null,
    fit_score integer default 0,
    technical_fit integer default 0,
    experience_fit integer default 0,
    matched_skills text[] default array[]::text[],
    missing_skills text[] default array[]::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.applications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    job_id uuid references public.jobs(id) on delete cascade not null,
    status text default 'draft',             -- draft | applied | interview | offer | rejected
    tailored_resume_url text,
    cover_letter text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.resumes (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text default 'Master Resume',
    file_path text,
    parsed_json jsonb default '{}'::jsonb,
    is_master boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------------
-- COMMUNITY (§18, §19)
-- ---------------------------------------------------------------------------
create table if not exists public.communities (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text unique not null,
    description text,
    track text,                              -- AI Engineering | DevOps | ...
    member_count integer default 0
);

create table if not exists public.community_members (
    community_id uuid references public.communities(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    role text default 'member',              -- member | moderator | admin
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (community_id, user_id)
);

create table if not exists public.posts (
    id uuid primary key default uuid_generate_v4(),
    community_id uuid references public.communities(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.comments (
    id uuid primary key default uuid_generate_v4(),
    post_id uuid references public.posts(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------------
-- BOOKMARKS with tags/notes/status (§31)
-- ---------------------------------------------------------------------------
create table if not exists public.bookmarks (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    item_type text not null,                 -- resource | creator | job | roadmap_topic | document
    item_id text not null,
    title text not null,
    url text,
    tags text[] default array[]::text[],
    notes text,
    status text default 'not_started',       -- not_started | in_progress | done
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (user_id, item_type, item_id)
);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS (§32)
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    type text not null,                      -- creator_update | roadmap_change | deadline | job_match | streak
    title text not null,
    body text,
    link text,
    read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------------
-- AGENT OBSERVABILITY (§42, §52)
-- ---------------------------------------------------------------------------
create table if not exists public.agent_runs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade,
    agent_name text not null,
    input_summary text,
    tools_used text[] default array[]::text[],
    status text default 'success',           -- success | error | timeout
    latency_ms integer,
    tokens_used integer default 0,
    cost_usd numeric(10,6) default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.tool_calls (
    id uuid primary key default uuid_generate_v4(),
    run_id uuid references public.agent_runs(id) on delete cascade,
    tool_name text not null,
    input_json jsonb default '{}'::jsonb,
    output_json jsonb default '{}'::jsonb,
    latency_ms integer,
    status text default 'success',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------------
-- AUDIT LOGS (§77)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete set null,
    action text not null,                    -- login | profile_update | data_export | github_connect | ...
    entity_type text,
    entity_id text,
    metadata jsonb default '{}'::jsonb,
    ip_address inet,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------------
-- RLS — user data isolation (§47)
-- ---------------------------------------------------------------------------
alter table public.resource_chunks enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.subjects enable row level security;
alter table public.academic_events enable row level security;
alter table public.job_matches enable row level security;
alter table public.applications enable row level security;
alter table public.resumes enable row level security;
alter table public.community_members enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.bookmarks enable row level security;
alter table public.notifications enable row level security;
alter table public.agent_runs enable row level security;
alter table public.tool_calls enable row level security;
alter table public.audit_logs enable row level security;

alter table public.communities enable row level security;
create policy "Communities readable by all" on public.communities for select to authenticated using (true);

create policy "Own documents" on public.documents for all using (auth.uid() = user_id);
create policy "Own document chunks" on public.document_chunks for all using (
    exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid())
);
create policy "Own resource chunks read" on public.resource_chunks for select to authenticated using (true);
create policy "Own conversations" on public.conversations for all using (auth.uid() = user_id);
create policy "Own messages" on public.messages for all using (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid())
);
create policy "Own subjects" on public.subjects for all using (auth.uid() = user_id);
create policy "Own academic events" on public.academic_events for all using (auth.uid() = user_id);
create policy "Own job matches" on public.job_matches for all using (auth.uid() = user_id);
create policy "Own applications" on public.applications for all using (auth.uid() = user_id);
create policy "Own resumes" on public.resumes for all using (auth.uid() = user_id);
create policy "Own community membership" on public.community_members for all using (auth.uid() = user_id);
create policy "Members can post" on public.posts for all using (auth.uid() = user_id);
create policy "Users can comment" on public.comments for all using (auth.uid() = user_id);
create policy "Own bookmarks" on public.bookmarks for all using (auth.uid() = user_id);
create policy "Own notifications" on public.notifications for all using (auth.uid() = user_id);
create policy "Own agent runs" on public.agent_runs for all using (auth.uid() = user_id);
create policy "Own tool calls" on public.tool_calls for all using (
    exists (select 1 from public.agent_runs r where r.id = run_id and r.user_id = auth.uid())
);
create policy "Own audit logs read" on public.audit_logs for select using (auth.uid() = user_id);

-- updated_at trigger helper
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_applications on public.applications;
create trigger touch_applications before update on public.applications
    for each row execute procedure public.touch_updated_at();

-- pgvector similarity search RPC helper
create or replace function match_resource_chunks(
    query_embedding vector(768),
    match_threshold float default 0.5,
    match_count int default 5
)
returns table (
    id uuid,
    resource_id uuid,
    content text,
    metadata jsonb,
    similarity float
)
language plpgsql
stable
as $$
begin
    return query
    select
        rc.id,
        rc.resource_id,
        rc.content,
        rc.metadata,
        1 - (rc.embedding <=> query_embedding) as similarity
    from public.resource_chunks rc
    where 1 - (rc.embedding <=> query_embedding) > match_threshold
    order by similarity desc
    limit match_count;
end;
$$;
