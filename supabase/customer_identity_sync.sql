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
