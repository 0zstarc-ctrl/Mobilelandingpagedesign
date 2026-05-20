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
  payment_method text check (
    payment_method is null
    or payment_method in (
      'card',
      'naver_pay',
      'kakao_pay',
      'simple_pay',
      'toss_pay',
      'payco',
      'samsung_pay',
      'apple_pay'
    )
  ),
  status text not null default 'checkout_started' check (status in ('checkout_started', 'pending_payment', 'paid', 'cancelled', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_session_id_idx on public.orders(session_id);
create index if not exists orders_customer_created_idx on public.orders(landing_customer_id, created_at);
create index if not exists orders_creator_campaign_created_idx on public.orders(creator_id, campaign_id, created_at);
create index if not exists orders_status_created_idx on public.orders(status, created_at);

alter table public.orders enable row level security;

grant insert on public.orders to anon, authenticated;
grant select on public.orders to authenticated;

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
