do $$
declare
  constraint_name text;
begin
  select conname
  into constraint_name
  from pg_constraint
  where conrelid = 'public.orders'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%payment_method%';

  if constraint_name is not null then
    execute format('alter table public.orders drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.orders
add constraint orders_payment_method_check
check (
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
);
