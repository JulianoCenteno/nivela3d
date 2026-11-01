-- =====================================================================
-- Nivela 3D — schema inicial (MVP)
-- Rode no Supabase: SQL Editor → cole este arquivo → Run.
-- =====================================================================

-- ---------- Perfis ----------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text,
  created_at  timestamptz not null default now()
);

-- ---------- Assinaturas (alimentada pelo webhook da plataforma) --------
-- Chaveada por e-mail: a compra pode acontecer antes do cadastro no app.
create table if not exists public.subscriptions (
  email               text primary key,
  plan                text not null check (plan in ('iniciante','profissional','empresa')),
  status              text not null check (status in ('active','canceled','past_due','refunded')),
  billing_cycle       text check (billing_cycle in ('mensal','trimestral','anual')),
  current_period_end  timestamptz,
  external_id         text,
  updated_at          timestamptz not null default now()
);

-- Log bruto dos webhooks recebidos (para auditoria e para ajustar o parser).
create table if not exists public.webhook_events (
  id          bigint generated always as identity primary key,
  source      text not null,
  payload     jsonb not null,
  result      text,
  received_at timestamptz not null default now()
);

-- ---------- Configurações de custo do usuário --------------------------
create table if not exists public.settings (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  business_name        text,
  energy_price_kwh     numeric(10,4) not null default 0.95,
  labor_per_hour       numeric(10,2) not null default 20,
  failure_rate_pct     numeric(5,2)  not null default 10,
  default_margin_pct   numeric(5,2)  not null default 50,
  updated_at           timestamptz not null default now()
);

-- ---------- Impressoras ------------------------------------------------
create table if not exists public.printers (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  name                  text not null,
  power_watts           numeric(10,2) not null default 150,
  purchase_price        numeric(12,2) not null default 0,
  lifetime_hours        numeric(10,0) not null default 5000,
  maintenance_per_hour  numeric(10,4) not null default 0.15,
  created_at            timestamptz not null default now()
);

-- ---------- Materiais (filamentos/resinas) -----------------------------
create table if not exists public.materials (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  type          text not null default 'PLA',
  color         text,
  price_per_kg  numeric(10,2) not null,
  created_at    timestamptz not null default now()
);

-- ---------- Canais de venda --------------------------------------------
create table if not exists public.channels (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  fee_pct     numeric(5,2)  not null default 0,
  fee_fixed   numeric(10,2) not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- Produtos ---------------------------------------------------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  category       text,
  printer_id     uuid references public.printers(id)  on delete set null,
  material_id    uuid references public.materials(id) on delete set null,
  weight_g       numeric(10,2) not null default 0,
  print_hours    numeric(10,2) not null default 0,
  labor_minutes  numeric(10,2) not null default 0,
  extra_costs    numeric(10,2) not null default 0,
  unit_cost      numeric(12,4) not null default 0,  -- calculado no app e salvo como referência
  sale_price     numeric(12,2) not null default 0,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------- Vendas -----------------------------------------------------
create table if not exists public.sales (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  product_id     uuid references public.products(id) on delete set null,
  channel_id     uuid references public.channels(id) on delete set null,
  description    text not null,
  category       text,
  quantity       integer not null default 1 check (quantity > 0),
  unit_price     numeric(12,2) not null,
  unit_cost      numeric(12,4) not null default 0,   -- foto do custo no momento da venda
  fee_pct        numeric(5,2)  not null default 0,
  fee_fixed      numeric(10,2) not null default 0,
  shipping_cost  numeric(10,2) not null default 0,
  sold_at        date not null default current_date,
  created_at     timestamptz not null default now()
);

create index if not exists sales_user_date_idx on public.sales(user_id, sold_at desc);
create index if not exists products_user_idx  on public.products(user_id);
create index if not exists printers_user_idx  on public.printers(user_id);
create index if not exists materials_user_idx on public.materials(user_id);
create index if not exists channels_user_idx  on public.channels(user_id);

-- =====================================================================
-- Plano do usuário + limites
-- =====================================================================

-- Dias de teste grátis para quem criou conta e ainda não tem assinatura.
create or replace function public.trial_days() returns int
language sql immutable as $$ select 7 $$;

-- Plano efetivo: assinatura ativa > teste grátis > 'nenhum'.
create or replace function public.user_plan(uid uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select s.plan from subscriptions s
       join profiles p on lower(p.email) = lower(s.email)
      where p.id = uid
        and s.status in ('active','past_due')
        and (s.current_period_end is null or s.current_period_end > now() - interval '3 days')
      limit 1),
    (select 'teste' from profiles p
      where p.id = uid and p.created_at > now() - make_interval(days => trial_days())),
    'nenhum'
  );
$$;

create or replace function public.plan_limit(plan text, resource text) returns int
language sql immutable as $$
  select case plan
    when 'teste'        then case resource when 'printers' then 1  when 'products' then 30  end
    when 'iniciante'    then case resource when 'printers' then 1  when 'products' then 30  end
    when 'profissional' then case resource when 'printers' then 5  when 'products' then 200 end
    when 'empresa'      then case resource when 'printers' then 15 when 'products' then 5000 end
    else 0
  end;
$$;

-- Bloqueia criação de registros além do limite do plano (vale também para a API).
create or replace function public.enforce_plan_limits() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  p text := user_plan(new.user_id);
  lim int;
  cnt int;
begin
  if p = 'nenhum' then
    raise exception 'PLANO_INATIVO: sua assinatura não está ativa.' using errcode = 'P0001';
  end if;
  if tg_table_name in ('printers','products') then
    lim := plan_limit(p, tg_table_name);
    execute format('select count(*) from %I where user_id = $1', tg_table_name) into cnt using new.user_id;
    if cnt >= lim then
      raise exception 'LIMITE_PLANO: seu plano permite até % %.', lim,
        case tg_table_name when 'printers' then 'impressoras' else 'produtos' end
        using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists printers_limit  on public.printers;
drop trigger if exists products_limit  on public.products;
drop trigger if exists sales_limit     on public.sales;
drop trigger if exists materials_limit on public.materials;
create trigger printers_limit  before insert on public.printers  for each row execute function enforce_plan_limits();
create trigger products_limit  before insert on public.products  for each row execute function enforce_plan_limits();
create trigger sales_limit     before insert on public.sales     for each row execute function enforce_plan_limits();
create trigger materials_limit before insert on public.materials for each row execute function enforce_plan_limits();

-- =====================================================================
-- Novo usuário: cria perfil, configurações e canal padrão
-- =====================================================================
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, name)
    values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''))
    on conflict (id) do nothing;
  insert into settings (user_id) values (new.id) on conflict do nothing;
  insert into channels (user_id, name, fee_pct, fee_fixed) values (new.id, 'Venda direta', 0, 0);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- =====================================================================
-- Row Level Security: cada usuário só enxerga os próprios dados
-- =====================================================================
alter table public.profiles       enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.webhook_events enable row level security;
alter table public.settings       enable row level security;
alter table public.printers       enable row level security;
alter table public.materials      enable row level security;
alter table public.channels       enable row level security;
alter table public.products       enable row level security;
alter table public.sales          enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "own subscription" on public.subscriptions;
create policy "own subscription" on public.subscriptions
  for select using (lower(email) = lower(auth.jwt()->>'email'));
-- webhook_events: sem policy → só o service role (webhook) acessa.

do $$
declare t text;
begin
  foreach t in array array['settings','printers','materials','channels','products','sales'] loop
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

-- O app só consulta o próprio plano.
create or replace function public.my_plan() returns text
language sql stable security definer set search_path = public as $$
  select user_plan(auth.uid());
$$;

revoke execute on function public.user_plan(uuid) from public, anon, authenticated;
grant execute on function public.my_plan() to authenticated;
