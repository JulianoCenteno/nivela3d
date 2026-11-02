-- =====================================================================
-- Nivela 3D — Webhook sem service role
-- O app chama estas funções com a chave pública (anon). Cada função confere
-- o token do webhook guardado numa tabela que ninguém consegue ler pela API.
-- =====================================================================
create table if not exists public.app_secrets (
  name  text primary key,
  value text not null
);
alter table public.app_secrets enable row level security;  -- sem policies: invisível pela API
revoke all on public.app_secrets from anon, authenticated;

create or replace function public.wh_check(p_token text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_token is null or not exists (select 1 from app_secrets where name = 'webhook_token' and value = p_token) then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
end $$;

create or replace function public.wh_log(p_token text, p_payload jsonb, p_result text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform wh_check(p_token);
  insert into webhook_events (source, payload, result) values ('digitalhub', p_payload, left(p_result, 1000));
end $$;

create or replace function public.wh_current_plan(p_token text, p_email text) returns text
language plpgsql security definer set search_path = public as $$
begin
  perform wh_check(p_token);
  return (select plan from subscriptions where email = lower(p_email));
end $$;

create or replace function public.wh_subscription(
  p_token text, p_email text, p_plan text, p_status text, p_cycle text, p_period_end timestamptz, p_external_id text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform wh_check(p_token);
  insert into subscriptions (email, plan, status, billing_cycle, current_period_end, external_id, updated_at)
  values (lower(p_email), p_plan, p_status, p_cycle, p_period_end, p_external_id, now())
  on conflict (email) do update set
    plan = excluded.plan, status = excluded.status, billing_cycle = excluded.billing_cycle,
    current_period_end = coalesce(excluded.current_period_end, subscriptions.current_period_end),
    external_id = coalesce(excluded.external_id, subscriptions.external_id), updated_at = now();
end $$;

create or replace function public.wh_purchases(
  p_token text, p_email text, p_products text[], p_status text, p_external_id text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform wh_check(p_token);
  insert into purchases (email, product, status, external_id, updated_at)
  select lower(p_email), unnest(p_products), p_status, p_external_id, now()
  on conflict (email, product) do update set status = excluded.status, external_id = excluded.external_id, updated_at = now();
end $$;

revoke execute on function public.wh_check(text) from public, anon, authenticated;
grant execute on function public.wh_log(text, jsonb, text) to anon;
grant execute on function public.wh_current_plan(text, text) to anon;
grant execute on function public.wh_subscription(text, text, text, text, text, timestamptz, text) to anon;
grant execute on function public.wh_purchases(text, text, text[], text, text) to anon;
-- O token é gravado separadamente (não fica no repositório):
-- insert into app_secrets (name, value) values ('webhook_token', '<TOKEN>');
