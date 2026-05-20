alter table public.orders
add column if not exists paid_at timestamptz,
add column if not exists cancelled_at timestamptz,
add column if not exists refunded_at timestamptz,
add column if not exists pg_provider text,
add column if not exists pg_order_id text,
add column if not exists attribution_snapshot jsonb not null default '{}'::jsonb;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  discount_amount integer not null default 0 check (discount_amount >= 0),
  line_total integer not null check (line_total >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  method text not null,
  pg_payment_id text,
  pg_transaction_id text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'failed', 'cancelled', 'refunded', 'partial_refunded')),
  requested_amount integer not null check (requested_amount >= 0),
  approved_amount integer not null default 0 check (approved_amount >= 0),
  currency text not null default 'KRW',
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  failed_at timestamptz,
  cancelled_at timestamptz,
  raw_request jsonb not null default '{}'::jsonb,
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, pg_payment_id)
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text,
  event_type text not null,
  order_id uuid references public.orders(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  payload jsonb not null,
  processed_at timestamptz,
  processing_error text,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  provider text not null,
  pg_refund_id text,
  amount integer not null check (amount > 0),
  reason text,
  status text not null default 'requested' check (status in ('requested', 'approved', 'failed', 'cancelled')),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.creator_commission_rules (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  campaign_id uuid references public.creator_campaigns(id) on delete cascade,
  commission_type text not null default 'rate' check (commission_type in ('rate', 'fixed')),
  commission_rate numeric(5, 2) not null default 0 check (commission_rate >= 0 and commission_rate <= 100),
  fixed_amount integer not null default 0 check (fixed_amount >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_settlements (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  settlement_month date not null,
  gross_sales_amount integer not null default 0 check (gross_sales_amount >= 0),
  refund_amount integer not null default 0 check (refund_amount >= 0),
  net_sales_amount integer not null default 0 check (net_sales_amount >= 0),
  commission_amount integer not null default 0 check (commission_amount >= 0),
  status text not null default 'draft' check (status in ('draft', 'reviewing', 'approved', 'paid', 'cancelled')),
  approved_at timestamptz,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (creator_id, settlement_month)
);

create table if not exists public.creator_settlement_items (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references public.creator_settlements(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete restrict,
  payment_id uuid references public.payments(id) on delete set null,
  campaign_id uuid references public.creator_campaigns(id) on delete set null,
  paid_amount integer not null default 0 check (paid_amount >= 0),
  refund_amount integer not null default 0 check (refund_amount >= 0),
  net_amount integer not null default 0 check (net_amount >= 0),
  commission_rate numeric(5, 2) not null default 0 check (commission_rate >= 0 and commission_rate <= 100),
  commission_amount integer not null default 0 check (commission_amount >= 0),
  created_at timestamptz not null default now(),
  unique (settlement_id, order_id)
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists payments_order_id_idx on public.payments(order_id);
create index if not exists payments_status_created_idx on public.payments(status, created_at);
create index if not exists payment_events_order_id_idx on public.payment_events(order_id);
create index if not exists payment_events_payment_id_idx on public.payment_events(payment_id);
create index if not exists refunds_order_id_idx on public.refunds(order_id);
create index if not exists commission_rules_creator_campaign_idx on public.creator_commission_rules(creator_id, campaign_id, status);
create index if not exists settlements_creator_month_idx on public.creator_settlements(creator_id, settlement_month);
create index if not exists settlement_items_settlement_id_idx on public.creator_settlement_items(settlement_id);

alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.refunds enable row level security;
alter table public.creator_commission_rules enable row level security;
alter table public.creator_settlements enable row level security;
alter table public.creator_settlement_items enable row level security;

revoke all on public.order_items from public, anon, authenticated;
revoke all on public.payments from public, anon, authenticated;
revoke all on public.payment_events from public, anon, authenticated;
revoke all on public.refunds from public, anon, authenticated;
revoke all on public.creator_commission_rules from public, anon, authenticated;
revoke all on public.creator_settlements from public, anon, authenticated;
revoke all on public.creator_settlement_items from public, anon, authenticated;

insert into public.creator_commission_rules (creator_id, campaign_id, commission_type, commission_rate)
select creators.id, null, 'rate', 10.00
from public.creators
where creators.slug = 'demo_creator'
  and not exists (
    select 1
    from public.creator_commission_rules
    where creator_commission_rules.creator_id = creators.id
      and creator_commission_rules.campaign_id is null
      and creator_commission_rules.status = 'active'
  );
