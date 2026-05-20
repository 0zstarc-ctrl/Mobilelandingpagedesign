create or replace view public.creator_monthly_sales_report
with (security_invoker = true)
as
select
  date_trunc('month', orders.created_at)::date as report_month,
  creators.id as creator_id,
  creators.slug as creator_slug,
  creators.display_name as creator_name,
  creator_campaigns.id as campaign_id,
  creator_campaigns.code as campaign_code,
  count(*) filter (where orders.status = 'checkout_started') as checkout_started_count,
  coalesce(sum(orders.total_amount) filter (where orders.status = 'checkout_started'), 0) as checkout_started_amount,
  count(*) filter (where orders.status = 'paid') as paid_order_count,
  coalesce(sum(orders.quantity) filter (where orders.status = 'paid'), 0) as paid_quantity,
  coalesce(sum(orders.total_amount) filter (where orders.status = 'paid'), 0) as paid_sales_amount,
  count(*) filter (where orders.status in ('cancelled', 'failed')) as cancelled_or_failed_count,
  min(orders.created_at) as first_order_at,
  max(orders.created_at) as last_order_at
from public.orders
left join public.creators
  on creators.id = orders.creator_id
left join public.creator_campaigns
  on creator_campaigns.id = orders.campaign_id
where orders.creator_id is not null
group by
  date_trunc('month', orders.created_at)::date,
  creators.id,
  creators.slug,
  creators.display_name,
  creator_campaigns.id,
  creator_campaigns.code;

create or replace view public.creator_monthly_funnel_report
with (security_invoker = true)
as
with visit_metrics as (
  select
    date_trunc('month', visits.created_at)::date as report_month,
    visits.creator_id,
    visits.campaign_id,
    count(*) as visit_count,
    count(distinct visits.session_id) as visitor_session_count,
    count(distinct visits.landing_customer_id) filter (where visits.landing_customer_id is not null) as known_visitor_count
  from public.visits
  where visits.creator_id is not null
  group by
    date_trunc('month', visits.created_at)::date,
    visits.creator_id,
    visits.campaign_id
),
diagnosis_metrics as (
  select
    date_trunc('month', diagnoses.created_at)::date as report_month,
    diagnoses.creator_id,
    diagnoses.campaign_id,
    count(*) as diagnosis_count,
    count(distinct diagnoses.landing_customer_id) filter (where diagnoses.landing_customer_id is not null) as diagnosed_customer_count
  from public.diagnoses
  where diagnoses.creator_id is not null
  group by
    date_trunc('month', diagnoses.created_at)::date,
    diagnoses.creator_id,
    diagnoses.campaign_id
),
order_metrics as (
  select
    date_trunc('month', orders.created_at)::date as report_month,
    orders.creator_id,
    orders.campaign_id,
    count(*) filter (where orders.status = 'checkout_started') as checkout_started_count,
    count(*) filter (where orders.status = 'paid') as paid_order_count,
    coalesce(sum(orders.total_amount) filter (where orders.status = 'paid'), 0) as paid_sales_amount
  from public.orders
  where orders.creator_id is not null
  group by
    date_trunc('month', orders.created_at)::date,
    orders.creator_id,
    orders.campaign_id
),
report_keys as (
  select report_month, creator_id, campaign_id from visit_metrics
  union
  select report_month, creator_id, campaign_id from diagnosis_metrics
  union
  select report_month, creator_id, campaign_id from order_metrics
)
select
  report_keys.report_month,
  creators.id as creator_id,
  creators.slug as creator_slug,
  creators.display_name as creator_name,
  creator_campaigns.id as campaign_id,
  creator_campaigns.code as campaign_code,
  coalesce(visit_metrics.visit_count, 0) as visit_count,
  coalesce(visit_metrics.visitor_session_count, 0) as visitor_session_count,
  coalesce(visit_metrics.known_visitor_count, 0) as known_visitor_count,
  coalesce(diagnosis_metrics.diagnosis_count, 0) as diagnosis_count,
  coalesce(diagnosis_metrics.diagnosed_customer_count, 0) as diagnosed_customer_count,
  coalesce(order_metrics.checkout_started_count, 0) as checkout_started_count,
  coalesce(order_metrics.paid_order_count, 0) as paid_order_count,
  coalesce(order_metrics.paid_sales_amount, 0) as paid_sales_amount
from report_keys
left join public.creators
  on creators.id = report_keys.creator_id
left join public.creator_campaigns
  on creator_campaigns.id = report_keys.campaign_id
left join visit_metrics
  on visit_metrics.report_month = report_keys.report_month
  and visit_metrics.creator_id = report_keys.creator_id
  and visit_metrics.campaign_id is not distinct from report_keys.campaign_id
left join diagnosis_metrics
  on diagnosis_metrics.report_month = report_keys.report_month
  and diagnosis_metrics.creator_id = report_keys.creator_id
  and diagnosis_metrics.campaign_id is not distinct from report_keys.campaign_id
left join order_metrics
  on order_metrics.report_month = report_keys.report_month
  and order_metrics.creator_id = report_keys.creator_id
  and order_metrics.campaign_id is not distinct from report_keys.campaign_id;

revoke all on public.creator_monthly_sales_report from public, anon, authenticated;
revoke all on public.creator_monthly_funnel_report from public, anon, authenticated;
