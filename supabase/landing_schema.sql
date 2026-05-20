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

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null default ('PNP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  session_id uuid not null,
  landing_customer_id uuid references public.landing_customers(id) on delete set null,
  creator_id uuid references public.creators(id) on delete set null,
  campaign_id uuid references public.creator_campaigns(id) on delete set null,
  item_type text not null check (item_type in ('product', 'set', 'payment')),
  item_id text not null,
  item_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price integer not null default 0 check (unit_price >= 0),
  total_amount integer not null default 0 check (total_amount >= 0),
  payment_method text check (payment_method in ('kakao_pay', 'naver_pay', 'card')),
  status text not null default 'checkout_started' check (status in ('checkout_started', 'pending_payment', 'paid', 'cancelled', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creator_campaigns_creator_id_idx on public.creator_campaigns(creator_id);
create index if not exists visits_session_id_idx on public.visits(session_id);
create index if not exists visits_creator_campaign_created_idx on public.visits(creator_id, campaign_id, created_at);
create index if not exists diagnoses_session_id_idx on public.diagnoses(session_id);
create index if not exists landing_customers_auth_user_id_idx on public.landing_customers(auth_user_id);
create index if not exists orders_session_id_idx on public.orders(session_id);
create index if not exists orders_customer_created_idx on public.orders(landing_customer_id, created_at);
create index if not exists orders_creator_campaign_created_idx on public.orders(creator_id, campaign_id, created_at);
create index if not exists orders_status_created_idx on public.orders(status, created_at);

alter table public.creators enable row level security;
alter table public.creator_campaigns enable row level security;
alter table public.landing_customers enable row level security;
alter table public.visits enable row level security;
alter table public.diagnoses enable row level security;
alter table public.orders enable row level security;

grant select on public.creators to anon, authenticated;
grant select on public.creator_campaigns to anon, authenticated;
grant insert on public.visits to anon, authenticated;
grant insert on public.diagnoses to anon, authenticated;
grant select, insert, update on public.landing_customers to authenticated;
grant insert on public.orders to anon, authenticated;
grant select on public.orders to authenticated;

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

drop policy if exists "Anyone can start checkout orders" on public.orders;
create policy "Anyone can start checkout orders"
on public.orders
for insert
to anon, authenticated
with check (
  landing_customer_id is null
  or exists (
    select 1
    from public.landing_customers
    where landing_customers.id = orders.landing_customer_id
      and landing_customers.auth_user_id = auth.uid()
  )
);

drop policy if exists "Customers can read own orders" on public.orders;
create policy "Customers can read own orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.landing_customers
    where landing_customers.id = orders.landing_customer_id
      and landing_customers.auth_user_id = auth.uid()
  )
);

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

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.sync_landing_customer(
  p_session_id uuid,
  p_marketing_opt_in boolean,
  p_creator_id uuid default null,
  p_campaign_id uuid default null,
  p_display_name text default null,
  p_email text default null,
  p_kakao_user_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_customer_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  insert into public.landing_customers (
    auth_user_id,
    kakao_user_id,
    display_name,
    email,
    marketing_opt_in,
    first_creator_id,
    first_campaign_id,
    last_creator_id,
    last_campaign_id
  )
  values (
    v_user_id,
    p_kakao_user_id,
    p_display_name,
    p_email,
    coalesce(p_marketing_opt_in, false),
    p_creator_id,
    p_campaign_id,
    p_creator_id,
    p_campaign_id
  )
  on conflict (auth_user_id) do update
  set kakao_user_id = coalesce(excluded.kakao_user_id, public.landing_customers.kakao_user_id),
      display_name = coalesce(excluded.display_name, public.landing_customers.display_name),
      email = coalesce(excluded.email, public.landing_customers.email),
      marketing_opt_in = excluded.marketing_opt_in,
      last_creator_id = coalesce(excluded.last_creator_id, public.landing_customers.last_creator_id),
      last_campaign_id = coalesce(excluded.last_campaign_id, public.landing_customers.last_campaign_id),
      updated_at = now()
  returning id into v_customer_id;

  update public.visits
  set landing_customer_id = v_customer_id
  where session_id = p_session_id
    and landing_customer_id is null;

  update public.diagnoses
  set landing_customer_id = v_customer_id
  where session_id = p_session_id
    and landing_customer_id is null;

  return v_customer_id;
end;
$$;

revoke all on function private.sync_landing_customer(uuid, boolean, uuid, uuid, text, text, text) from public, anon;
grant execute on function private.sync_landing_customer(uuid, boolean, uuid, uuid, text, text, text) to authenticated;

create or replace function public.sync_landing_customer(
  p_session_id uuid,
  p_marketing_opt_in boolean,
  p_creator_id uuid default null,
  p_campaign_id uuid default null,
  p_display_name text default null,
  p_email text default null,
  p_kakao_user_id text default null
)
returns uuid
language sql
security invoker
set search_path = public, pg_temp
as $$
  select private.sync_landing_customer(
    p_session_id,
    p_marketing_opt_in,
    p_creator_id,
    p_campaign_id,
    p_display_name,
    p_email,
    p_kakao_user_id
  );
$$;

revoke all on function public.sync_landing_customer(uuid, boolean, uuid, uuid, text, text, text) from public, anon;
grant execute on function public.sync_landing_customer(uuid, boolean, uuid, uuid, text, text, text) to authenticated;

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
