create extension if not exists pgcrypto;

create table if not exists public.creators (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_campaigns (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  code text not null,
  benefit_label text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (creator_id, code)
);

create table if not exists public.landing_customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  kakao_user_id text,
  display_name text,
  email text,
  phone text,
  marketing_opt_in boolean not null default false,
  first_creator_id uuid references public.creators(id) on delete set null,
  first_campaign_id uuid references public.creator_campaigns(id) on delete set null,
  last_creator_id uuid references public.creators(id) on delete set null,
  last_campaign_id uuid references public.creator_campaigns(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  landing_customer_id uuid references public.landing_customers(id) on delete set null,
  creator_id uuid references public.creators(id) on delete set null,
  campaign_id uuid references public.creator_campaigns(id) on delete set null,
  landing_url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  content_id text,
  user_agent text,
  attribution_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  landing_customer_id uuid references public.landing_customers(id) on delete set null,
  creator_id uuid references public.creators(id) on delete set null,
  campaign_id uuid references public.creator_campaigns(id) on delete set null,
  answers jsonb not null default '[]'::jsonb,
  result jsonb not null default '{}'::jsonb,
  result_code text,
  created_at timestamptz not null default now()
);

create index if not exists creator_campaigns_creator_id_idx on public.creator_campaigns(creator_id);
create index if not exists visits_session_id_idx on public.visits(session_id);
create index if not exists visits_creator_campaign_created_idx on public.visits(creator_id, campaign_id, created_at);
create index if not exists diagnoses_session_id_idx on public.diagnoses(session_id);
create index if not exists landing_customers_auth_user_id_idx on public.landing_customers(auth_user_id);

alter table public.creators enable row level security;
alter table public.creator_campaigns enable row level security;
alter table public.landing_customers enable row level security;
alter table public.visits enable row level security;
alter table public.diagnoses enable row level security;

grant select on public.creators to anon, authenticated;
grant select on public.creator_campaigns to anon, authenticated;
grant insert on public.visits to anon, authenticated;
grant insert on public.diagnoses to anon, authenticated;
grant select, insert, update on public.landing_customers to authenticated;

drop policy if exists "Active creators are readable" on public.creators;
create policy "Active creators are readable"
on public.creators
for select
to anon, authenticated
using (status = 'active');

drop policy if exists "Active campaigns are readable" on public.creator_campaigns;
create policy "Active campaigns are readable"
on public.creator_campaigns
for select
to anon, authenticated
using (
  status = 'active'
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

drop policy if exists "Anyone can record landing visits" on public.visits;
create policy "Anyone can record landing visits"
on public.visits
for insert
to anon, authenticated
with check (true);

drop policy if exists "Anyone can record diagnoses" on public.diagnoses;
create policy "Anyone can record diagnoses"
on public.diagnoses
for insert
to anon, authenticated
with check (true);

drop policy if exists "Customers can read own landing profile" on public.landing_customers;
create policy "Customers can read own landing profile"
on public.landing_customers
for select
to authenticated
using (auth_user_id = auth.uid());

drop policy if exists "Customers can create own landing profile" on public.landing_customers;
create policy "Customers can create own landing profile"
on public.landing_customers
for insert
to authenticated
with check (auth_user_id = auth.uid());

drop policy if exists "Customers can update own landing profile" on public.landing_customers;
create policy "Customers can update own landing profile"
on public.landing_customers
for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

insert into public.creators (slug, display_name)
values ('demo_creator', 'Demo Creator')
on conflict (slug) do update
set display_name = excluded.display_name,
    status = 'active',
    updated_at = now();

insert into public.creator_campaigns (creator_id, code, benefit_label)
select id, 'demo_may_2026', 'Demo Creator 구독자 전용 10% 혜택'
from public.creators
where slug = 'demo_creator'
on conflict (creator_id, code) do update
set benefit_label = excluded.benefit_label,
    status = 'active',
    updated_at = now();
