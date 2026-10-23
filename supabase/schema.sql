-- ═══════════════════════════════════════════════════════════════
-- FetchMedia · Complete Supabase schema (A → Z)
--
-- HOW TO RUN: select ALL (Ctrl+A) → Run. Do NOT run in pieces —
-- functions/policies reference tables, so order matters.
-- Safe to re-run (every statement is IF NOT EXISTS / OR REPLACE).
-- Service role bypasses RLS; anon/authenticated go through policies.
-- ═══════════════════════════════════════════════════════════════

-- ═══════════ STEP 1 · EXTENSIONS ═══════════
create extension if not exists "pgcrypto";

-- ═══════════ STEP 2 · TABLES (no dependencies between each other
--              except FKs, listed base-first) ═══════════

-- 2a · PROFILES (references auth.users — managed by Supabase Auth)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  avatar_url   text,
  role         text not null default 'user' check (role in ('user','admin')),
  plan         text not null default 'free' check (plan in ('guest','free','pro')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 2b · USER PREFERENCES (theme, quality…)
create table if not exists public.user_preferences (
  user_id          uuid primary key references public.profiles(id) on delete cascade,
  accent           text not null default 'ink'
    check (accent in ('ink','snow','blush','honey','moss','azure','maroon')),
  mode             text not null default 'system' check (mode in ('light','dark','system')),
  default_quality  text not null default 'highest',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 2c · DOWNLOADS
create table if not exists public.downloads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete set null,
  session_id    text,                       -- guest bucket (anon id from client)
  source_url    text not null,
  platform      text not null,
  content_type  text,
  title         text,
  thumbnail     text,
  status        text not null default 'pending'
    check (status in ('pending','processing','completed','failed','expired')),
  error_code    text,
  processing_ms integer,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz,
  expires_at    timestamptz
);

-- 2d · DOWNLOAD ITEMS
create table if not exists public.download_items (
  id          uuid primary key default gen_random_uuid(),
  download_id uuid not null references public.downloads(id) on delete cascade,
  media_type  text not null check (media_type in ('video','image','audio')),
  format      text,
  quality     text,
  width       integer,
  height      integer,
  duration    integer,
  mime        text,
  storage_key text,                          -- R2 key under downloads/…
  file_size   bigint,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- 2e · STORAGE OBJECTS (R2 ledger)
create table if not exists public.storage_objects (
  storage_key text primary key,              -- same key as download_items.storage_key
  bytes       bigint,
  mime        text,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz
);

-- 2f · API USAGE
create table if not exists public.api_usage (
  id            bigint generated always as identity primary key,
  user_id       uuid references public.profiles(id) on delete set null,
  ip_hash       text,                        -- sha256(ip), truncated — never raw IPs
  platform      text,
  request_type  text,                        -- resolve | download | …
  endpoint      text,
  status        text,                        -- ok | error | rate_limited
  response_time integer,                     -- ms
  created_at    timestamptz not null default now()
);

-- 2g · ERROR LOGS
create table if not exists public.error_logs (
  id            bigint generated always as identity primary key,
  request_id    text,
  platform      text,
  error_code    text,
  message       text,
  processing_ms integer,
  created_at    timestamptz not null default now()
);

-- 2h · PLATFORM STATUS
create table if not exists public.platform_status (
  platform    text primary key,
  status      text not null default 'Operational'
    check (status in ('Operational','Degraded','Unavailable','Maintenance')),
  message     text,
  latency_ms  integer,
  success_24h numeric(5,2),
  checked_at  timestamptz,
  updated_at  timestamptz not null default now()
);

-- 2i · RATE LIMIT OVERRIDES
create table if not exists public.rate_limit_overrides (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  hourly_limit integer not null default 200,
  note         text,
  created_at   timestamptz not null default now()
);

-- ═══════════ STEP 3 · INDEXES ═══════════
create index if not exists downloads_user_idx     on public.downloads(user_id, created_at desc);
create index if not exists downloads_status_idx   on public.downloads(status, created_at desc);
create index if not exists downloads_platform_idx on public.downloads(platform, created_at desc);
create index if not exists items_download_idx     on public.download_items(download_id);
create index if not exists storage_expiry_idx     on public.storage_objects(expires_at);
create index if not exists usage_time_idx         on public.api_usage(created_at desc);
create index if not exists usage_platform_idx     on public.api_usage(platform, created_at desc);
create index if not exists errors_time_idx        on public.error_logs(created_at desc);
create index if not exists errors_platform_idx    on public.error_logs(platform, created_at desc);

-- ═══════════ STEP 4 · SEED DATA ═══════════
insert into public.platform_status (platform) values
  ('instagram'),('youtube'),('facebook'),('x'),('tiktok'),
  ('reddit'),('pinterest'),('threads'),('vimeo')
on conflict (platform) do nothing;

-- ═══════════ STEP 5 · FUNCTIONS (tables above now exist,
--              so SQL-language bodies validate cleanly) ═══════════
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
          new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  insert into public.user_preferences (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- ═══════════ STEP 6 · TRIGGERS ═══════════
drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_prefs_touch on public.user_preferences;
create trigger trg_prefs_touch before update on public.user_preferences
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_pstatus_touch on public.platform_status;
create trigger trg_pstatus_touch before update on public.platform_status
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_new_user on auth.users;
create trigger trg_new_user after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════ STEP 7 · ANALYTICS VIEW ═══════════
create or replace view public.daily_stats as
select date_trunc('day', created_at)::date as day,
       platform,
       count(*) as requests,
       count(*) filter (where status = 'ok') as successful,
       avg(response_time)::int as avg_ms
from public.api_usage
group by 1, 2;

-- ═══════════ STEP 8 · RLS (functions above now exist,
--              so policy expressions validate cleanly) ═══════════
alter table public.profiles             enable row level security;
alter table public.user_preferences     enable row level security;
alter table public.downloads            enable row level security;
alter table public.download_items       enable row level security;
alter table public.storage_objects      enable row level security;
alter table public.api_usage            enable row level security;
alter table public.error_logs           enable row level security;
alter table public.platform_status      enable row level security;
alter table public.rate_limit_overrides enable row level security;

-- profiles: read/update own · admin all
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- preferences: own only (+admin)
drop policy if exists "own prefs" on public.user_preferences;
create policy "own prefs" on public.user_preferences
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- downloads: own (or admin); anyone can insert guest rows (user_id null)
drop policy if exists "read own downloads" on public.downloads;
create policy "read own downloads" on public.downloads
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "insert downloads" on public.downloads;
create policy "insert downloads" on public.downloads
  for insert with check (auth.uid() = user_id or user_id is null or public.is_admin());

-- items: via parent download ownership
drop policy if exists "read own items" on public.download_items;
create policy "read own items" on public.download_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.downloads d
      where d.id = download_id and d.user_id = auth.uid()
    )
  );

-- platform_status: public read · admin write
drop policy if exists "public status read" on public.platform_status;
create policy "public status read" on public.platform_status for select using (true);
drop policy if exists "admin status write" on public.platform_status;
create policy "admin status write" on public.platform_status
  for all using (public.is_admin()) with check (public.is_admin());

-- usage / errors / storage / overrides: admin read (writes via service role)
drop policy if exists "admin usage read" on public.api_usage;
create policy "admin usage read" on public.api_usage
  for select using (public.is_admin());
drop policy if exists "admin errors read" on public.error_logs;
create policy "admin errors read" on public.error_logs
  for select using (public.is_admin());
drop policy if exists "admin storage" on public.storage_objects;
create policy "admin storage" on public.storage_objects
  for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin overrides" on public.rate_limit_overrides;
create policy "admin overrides" on public.rate_limit_overrides
  for all using (public.is_admin()) with check (public.is_admin());
