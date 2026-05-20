create table if not exists public.admin_users (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.is_landing_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users
    where admin_users.auth_user_id = auth.uid()
  );
$$;

revoke all on function private.is_landing_admin() from public, anon, authenticated;

create or replace function private.get_creator_admin_reports()
returns table (
  report_month date,
  creator_slug text,
  creator_name text,
  campaign_code text,
  visit_count bigint,
  visitor_session_count bigint,
  known_visitor_count bigint,
  diagnosis_count bigint,
  diagnosed_customer_count bigint,
  checkout_started_count bigint,
  checkout_started_amount numeric,
  paid_order_count bigint,
  paid_quantity numeric,
  paid_sales_amount numeric,
  cancelled_or_failed_count bigint
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    funnel.report_month,
    funnel.creator_slug,
    funnel.creator_name,
    funnel.campaign_code,
    funnel.visit_count,
    funnel.visitor_session_count,
    funnel.known_visitor_count,
    funnel.diagnosis_count,
    funnel.diagnosed_customer_count,
    funnel.checkout_started_count,
    sales.checkout_started_amount,
    funnel.paid_order_count,
    sales.paid_quantity,
    funnel.paid_sales_amount,
    sales.cancelled_or_failed_count
  from public.creator_monthly_funnel_report as funnel
  left join public.creator_monthly_sales_report as sales
    on sales.report_month = funnel.report_month
    and sales.creator_id = funnel.creator_id
    and sales.campaign_id is not distinct from funnel.campaign_id
  where private.is_landing_admin()
  order by funnel.report_month desc, funnel.creator_slug, funnel.campaign_code;
$$;

revoke all on function private.get_creator_admin_reports() from public, anon;
grant execute on function private.get_creator_admin_reports() to authenticated;

create or replace function public.get_creator_admin_reports()
returns table (
  report_month date,
  creator_slug text,
  creator_name text,
  campaign_code text,
  visit_count bigint,
  visitor_session_count bigint,
  known_visitor_count bigint,
  diagnosis_count bigint,
  diagnosed_customer_count bigint,
  checkout_started_count bigint,
  checkout_started_amount numeric,
  paid_order_count bigint,
  paid_quantity numeric,
  paid_sales_amount numeric,
  cancelled_or_failed_count bigint
)
language sql
security invoker
set search_path = public, pg_temp
as $$
  select * from private.get_creator_admin_reports();
$$;

revoke all on function public.get_creator_admin_reports() from public, anon;
grant execute on function public.get_creator_admin_reports() to authenticated;
