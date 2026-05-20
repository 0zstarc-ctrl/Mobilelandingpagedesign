# Payment and Settlement Data Model Extension

## 1. Purpose

This document extends the current Pick & Pill landing MVP into a payment-ready commerce and creator settlement model.

Current state:

- `visits` tracks creator/campaign attribution.
- `landing_customers` stores Kakao-authenticated customers.
- `diagnoses` stores health-check funnel answers and result codes.
- `orders` records checkout-start events from product, set, and payment CTAs.
- `creator_monthly_sales_report` and `creator_monthly_funnel_report` aggregate creator/campaign performance.
- `?admin=1` shows an internal monthly report dashboard.

The next backend milestone is to connect a PG provider and convert `orders.status` from `checkout_started` to payment lifecycle states such as `pending_payment`, `paid`, `cancelled`, and `refunded`.

## 2. Design Goals

- Preserve creator attribution at the time of order.
- Make payment callbacks idempotent and auditable.
- Separate payment records from business order records.
- Support card, Naver Pay, Kakao Pay, and future simple payments through a PG-first design.
- Calculate creator settlement from confirmed paid/refunded orders.
- Keep public browser clients away from service-role keys, PG secrets, and webhook secrets.
- Keep settlement reports reproducible from immutable payment/order events.

## 3. Recommended Payment Integration Pattern

Use Supabase Edge Functions as the payment backend.

```text
Landing page
  -> create checkout session Edge Function
  -> PG payment window or redirect
  -> PG webhook Edge Function
  -> Supabase orders/payments/order_events
  -> Alimtalk/CRM queue
  -> settlement reports
```

Frontend should only:

- Ask the backend to create a checkout session.
- Redirect/open the PG payment window with backend-provided parameters.
- Show payment result pages.

Frontend should never:

- Hold PG secret keys.
- Mark orders as paid.
- Trust payment success from query parameters alone.

## 4. Core Tables

### 4.1 `orders`

Existing table. It should become the business order header.

Important current columns:

- `id`
- `order_number`
- `session_id`
- `landing_customer_id`
- `creator_id`
- `campaign_id`
- `item_type`
- `item_id`
- `item_name`
- `quantity`
- `unit_price`
- `total_amount`
- `payment_method`
- `status`
- `metadata`
- `created_at`
- `updated_at`

Recommended additions:

```sql
alter table public.orders
add column if not exists paid_at timestamptz,
add column if not exists cancelled_at timestamptz,
add column if not exists refunded_at timestamptz,
add column if not exists pg_provider text,
add column if not exists pg_order_id text,
add column if not exists attribution_snapshot jsonb not null default '{}'::jsonb;
```

Recommended status lifecycle:

```text
checkout_started
pending_payment
paid
cancelled
failed
refunded
partial_refunded
shipping
delivered
```

Settlement should only count eligible final revenue:

- Include: `paid`, optionally `delivered` depending on settlement policy.
- Exclude: `checkout_started`, `pending_payment`, `failed`, `cancelled`.
- Deduct: `refunded`, `partial_refunded`.

### 4.2 `order_items`

Use this when a cart can include multiple products.

```sql
create table public.order_items (
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
```

The current MVP stores one item directly in `orders`. That is acceptable for now. Add `order_items` before multi-item carts or final PG integration.

### 4.3 `payments`

Payment attempts and approvals should be stored separately from orders.

```sql
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  method text not null,
  pg_payment_id text,
  pg_transaction_id text,
  status text not null default 'pending',
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
```

Payment statuses:

```text
pending
approved
failed
cancelled
refunded
partial_refunded
```

### 4.4 `payment_events`

Store every webhook/callback payload for audit and idempotency.

```sql
create table public.payment_events (
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
```

If a PG does not provide an `event_id`, derive an idempotency key from stable fields such as provider transaction id, order id, event type, amount, and event timestamp.

### 4.5 `refunds`

```sql
create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  provider text not null,
  pg_refund_id text,
  amount integer not null check (amount > 0),
  reason text,
  status text not null default 'requested',
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

Refund statuses:

```text
requested
approved
failed
cancelled
```

## 5. Creator Settlement Tables

### 5.1 `creator_commission_rules`

Commission should not be hardcoded in reports.

```sql
create table public.creator_commission_rules (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  campaign_id uuid references public.creator_campaigns(id) on delete cascade,
  commission_type text not null default 'rate',
  commission_rate numeric(5, 2) not null default 0,
  fixed_amount integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Recommended priority:

1. Campaign-specific rule
2. Creator default rule
3. Fallback 0%

### 5.2 `creator_settlements`

Monthly settlement header.

```sql
create table public.creator_settlements (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  settlement_month date not null,
  gross_sales_amount integer not null default 0,
  refund_amount integer not null default 0,
  net_sales_amount integer not null default 0,
  commission_amount integer not null default 0,
  status text not null default 'draft',
  approved_at timestamptz,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (creator_id, settlement_month)
);
```

Settlement statuses:

```text
draft
reviewing
approved
paid
cancelled
```

### 5.3 `creator_settlement_items`

Line-level settlement evidence.

```sql
create table public.creator_settlement_items (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references public.creator_settlements(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete restrict,
  payment_id uuid references public.payments(id) on delete set null,
  campaign_id uuid references public.creator_campaigns(id) on delete set null,
  paid_amount integer not null default 0,
  refund_amount integer not null default 0,
  net_amount integer not null default 0,
  commission_rate numeric(5, 2) not null default 0,
  commission_amount integer not null default 0,
  created_at timestamptz not null default now(),
  unique (settlement_id, order_id)
);
```

## 6. Settlement Calculation Policy

Recommended MVP policy:

```text
net_amount = paid_amount - refund_amount
commission_amount = floor(net_amount * commission_rate / 100)
```

Questions to finalize before production:

- Is commission based on VAT-inclusive or VAT-exclusive sales?
- Are shipping fees included in commission?
- Are coupon/discount amounts deducted before commission?
- Are partial refunds deducted in the same month or original sales month?
- Is settlement finalized after payment date, delivery date, or refund waiting period?

Recommended default:

- Use paid date for initial monthly report.
- Finalize settlement after refund/cancellation window.
- Keep monthly report and final payable settlement separate.

## 7. Edge Function Responsibilities

### 7.1 `create-checkout-session`

Inputs:

- `order_id` or item payload
- `payment_method`
- customer session JWT

Responsibilities:

- Verify authenticated customer if required.
- Create or update `orders` to `pending_payment`.
- Create `payments` row with `pending`.
- Call PG session/request API.
- Return payment URL or widget parameters.

### 7.2 `payment-webhook`

Responsibilities:

- Verify PG signature.
- Store raw payload in `payment_events`.
- Enforce idempotency.
- Update `payments`.
- Update `orders.status`.
- Queue Kakao Alimtalk message for paid/cancelled/refunded events.

### 7.3 `generate-monthly-settlements`

Responsibilities:

- Run monthly or manually.
- Find eligible paid/refunded orders.
- Apply commission rules.
- Create `creator_settlements` and `creator_settlement_items`.
- Mark settlement as `draft` for admin review.

## 8. Admin Report Evolution

Current `?admin=1` report shows:

- Visits
- Diagnoses
- Checkout starts
- Checkout-start amount
- Paid count/amount

Next additions after payment integration:

- Payment pending count
- Paid conversion rate
- Refund amount
- Net sales amount
- Estimated commission amount
- Settlement status
- CSV export

## 9. Security and RLS

Recommended rules:

- Public clients can create checkout intent only through Edge Function after validation.
- Public clients should not update `orders.status`.
- `payments`, `payment_events`, `refunds`, `creator_settlements`, and `creator_settlement_items` should not be exposed to `anon`.
- Admin report access should go through `admin_users` and RPC checks.
- Service role should only run in Supabase Edge Functions or trusted backend jobs.

## 10. Implementation Order

1. Add payment/settlement tables.
2. Add commission rules with demo creator rate.
3. Extend admin report to include estimated commission.
4. Choose PG provider and implement `create-checkout-session`.
5. Implement webhook verification and idempotent payment updates.
6. Add order complete/failure UI.
7. Add Alimtalk queue table and paid-order notification.
8. Add monthly settlement generation job.
9. Add CSV export or downloadable report.

## 11. Open Decisions

- PG provider: Toss Payments, PortOne, NICE/KCP, KG Inicis, or another provider.
- Naver Pay/Kakao Pay: direct integration or PG-supported simple payment.
- Commission policy: creator-level, campaign-level, product-level, or mixed.
- Settlement timing: paid month, delivered month, or refund-window month.
- Tax invoice and withholding process for creators.
