-- =====================================================================
-- Nivela 3D — Orçamentos, Pedidos, Estoque (Profissional) e
-- Equipe + Automações (Empresa).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Equipe: o dono (owner) convida membros por e-mail. O membro trabalha
-- nos dados do dono. "Conta" = id do dono.
-- ---------------------------------------------------------------------
create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  email       text not null,
  name        text,
  member_id   uuid references auth.users(id) on delete cascade,
  status      text not null default 'pendente' check (status in ('pendente','ativo')),
  created_at  timestamptz not null default now(),
  unique (owner_id, email)
);
create index if not exists team_members_member_idx on public.team_members(member_id);
create index if not exists team_members_email_idx on public.team_members(lower(email));

-- Conta em que o usuário logado trabalha: a do dono que o convidou
-- (se o dono estiver no plano Empresa) ou a própria.
create or replace function public.account_id() returns uuid
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select t.owner_id from team_members t
      where t.member_id = auth.uid() and t.status = 'ativo'
        and user_plan(t.owner_id) = 'empresa'
      order by t.created_at limit 1),
    auth.uid()
  );
$$;
grant execute on function public.account_id() to authenticated;

-- O plano visto pelo app é o da conta (o membro herda o plano Empresa do dono).
create or replace function public.my_plan() returns text
language sql stable security definer set search_path = public as $$
  select user_plan(account_id());
$$;

-- Papel do usuário logado: 'dono' ou 'membro'.
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select case when account_id() = auth.uid() then 'dono' else 'membro' end;
$$;
grant execute on function public.my_role() to authenticated;

-- Liga convites pendentes ao usuário logado (chamado ao abrir o app).
create or replace function public.accept_invites() returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update team_members
     set member_id = auth.uid(), status = 'ativo'
   where lower(email) = lower(auth.jwt()->>'email')
     and member_id is null
     and owner_id <> auth.uid();
  get diagnostics n = row_count;
  return n;
end $$;
grant execute on function public.accept_invites() to authenticated;

alter table public.team_members enable row level security;
drop policy if exists "owner manages team" on public.team_members;
create policy "owner manages team" on public.team_members
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid() and (select public.my_plan()) = 'empresa');
drop policy if exists "member sees own invite" on public.team_members;
create policy "member sees own invite" on public.team_members
  for select using (member_id = auth.uid());

-- Limite de membros por equipe (plano Empresa): 5.
create or replace function public.enforce_team_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from team_members where owner_id = new.owner_id) >= 5 then
    raise exception 'LIMITE_PLANO: sua equipe pode ter até 5 pessoas.' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists team_limit on public.team_members;
create trigger team_limit before insert on public.team_members
  for each row execute function enforce_team_limit();

-- ---------------------------------------------------------------------
-- Estoque: filamento (g), insumos (un) e peças prontas (un)
-- ---------------------------------------------------------------------
alter table public.materials add column if not exists stock_g     numeric(12,2) not null default 0;
alter table public.materials add column if not exists min_stock_g numeric(12,2) not null default 0;
alter table public.supplies  add column if not exists stock_qty   numeric(12,2) not null default 0;
alter table public.supplies  add column if not exists min_qty     numeric(12,2) not null default 0;
alter table public.products  add column if not exists stock_qty   numeric(12,2) not null default 0;
alter table public.products  add column if not exists min_qty     numeric(12,2) not null default 0;

create table if not exists public.stock_movements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_type   text not null check (item_type in ('material','supply','product')),
  item_id     uuid not null,
  item_name   text not null,
  qty         numeric(12,2) not null,          -- positivo = entrada, negativo = saída
  reason      text not null,
  order_id    uuid,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists stock_movements_user_idx on public.stock_movements(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- Orçamentos e pedidos
-- items: [{"product_id": uuid|null, "description": text, "qty": n, "unit_price": n, "unit_cost": n}]
-- ---------------------------------------------------------------------
create table if not exists public.quotes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  number          bigint generated always as identity,
  customer_name   text not null,
  customer_phone  text,
  items           jsonb not null default '[]'::jsonb,
  discount        numeric(12,2) not null default 0,
  shipping        numeric(12,2) not null default 0,   -- frete cobrado do cliente
  channel_id      uuid references public.channels(id) on delete set null,
  valid_until     date,
  delivery_days   integer,
  notes           text,
  status          text not null default 'aberto' check (status in ('aberto','enviado','aprovado','recusado','convertido')),
  public_token    text unique,
  order_id        uuid,
  approved_at     timestamptz,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists quotes_user_idx on public.quotes(user_id, created_at desc);

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  number          bigint generated always as identity,
  quote_id        uuid references public.quotes(id) on delete set null,
  customer_name   text not null,
  customer_phone  text,
  items           jsonb not null default '[]'::jsonb,
  discount        numeric(12,2) not null default 0,
  shipping        numeric(12,2) not null default 0,   -- frete cobrado do cliente
  shipping_cost   numeric(12,2) not null default 0,   -- frete pago por você
  channel_id      uuid references public.channels(id) on delete set null,
  due_date        date,
  status          text not null default 'novo' check (status in ('novo','producao','pronto','entregue','cancelado')),
  notes           text,
  assigned_to     uuid references auth.users(id) on delete set null,
  stock_deducted  boolean not null default false,
  sale_registered boolean not null default false,
  delivered_at    timestamptz,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id, created_at desc);
alter table public.quotes drop constraint if exists quotes_order_fk;
alter table public.quotes add constraint quotes_order_fk foreign key (order_id) references public.orders(id) on delete set null;

-- Vendas criadas a partir de um pedido
alter table public.sales add column if not exists order_id uuid references public.orders(id) on delete set null;

-- Recursos do plano Profissional+ (bloqueio também no banco)
create or replace function public.plan_has(plan text, feature text) returns boolean
language sql immutable as $$
  select case feature
    when 'gestao'     then plan in ('teste','profissional','empresa')
    when 'automacoes' then plan = 'empresa'
    when 'equipe'     then plan = 'empresa'
    else false end;
$$;

create or replace function public.enforce_gestao() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not plan_has(user_plan(new.user_id), 'gestao') then
    raise exception 'LIMITE_PLANO: pedidos, orçamentos e estoque fazem parte do plano Profissional.' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists quotes_plan on public.quotes;
drop trigger if exists orders_plan on public.orders;
drop trigger if exists stock_plan  on public.stock_movements;
create trigger quotes_plan before insert on public.quotes          for each row execute function enforce_gestao();
create trigger orders_plan before insert on public.orders          for each row execute function enforce_gestao();
create trigger stock_plan  before insert on public.stock_movements for each row execute function enforce_gestao();

-- ---------------------------------------------------------------------
-- RLS: todas as tabelas de dados passam a usar a conta (dono ou equipe)
-- ---------------------------------------------------------------------
alter table public.stock_movements enable row level security;
alter table public.quotes          enable row level security;
alter table public.orders          enable row level security;

do $$
declare t text;
begin
  foreach t in array array['settings','printers','materials','channels','products','sales','supplies','stock_movements','quotes','orders'] loop
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all using (user_id = (select public.account_id())) with check (user_id = (select public.account_id()))', t);
  end loop;
end $$;

-- Perfis dos colegas de equipe (para mostrar nomes)
drop policy if exists "team profiles" on public.profiles;
create policy "team profiles" on public.profiles
  for select using (
    id in (select member_id from team_members where owner_id = (select public.account_id()) and member_id is not null)
    or id = (select public.account_id())
  );

-- Compras extras: o membro enxerga as do dono? Não — cada um vê as suas.

-- ---------------------------------------------------------------------
-- Link público do orçamento (automação do plano Empresa)
-- ---------------------------------------------------------------------
create or replace function public.get_public_quote(p_token text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'number', q.number,
    'customer_name', q.customer_name,
    'items', q.items,
    'discount', q.discount,
    'shipping', q.shipping,
    'valid_until', q.valid_until,
    'delivery_days', q.delivery_days,
    'notes', q.notes,
    'status', q.status,
    'created_at', q.created_at,
    'business_name', coalesce(nullif(s.business_name, ''), 'Orçamento'),
    'expired', (q.valid_until is not null and q.valid_until < current_date)
  )
  from quotes q
  left join settings s on s.user_id = q.user_id
  where q.public_token = p_token
    and length(p_token) >= 20
    and user_plan(q.user_id) = 'empresa';
$$;

-- Cliente aprova pelo link: o orçamento vira pedido automaticamente.
create or replace function public.approve_public_quote(p_token text) returns text
language plpgsql security definer set search_path = public as $$
declare
  q quotes%rowtype;
  new_order uuid;
begin
  select * into q from quotes where public_token = p_token and length(p_token) >= 20 for update;
  if not found or user_plan(q.user_id) <> 'empresa' then
    return 'nao_encontrado';
  end if;
  if q.status in ('aprovado','convertido') then
    return 'ja_aprovado';
  end if;
  if q.status = 'recusado' or (q.valid_until is not null and q.valid_until < current_date) then
    return 'expirado';
  end if;

  insert into orders (user_id, quote_id, customer_name, customer_phone, items, discount, shipping, channel_id, due_date, notes, created_by)
  values (q.user_id, q.id, q.customer_name, q.customer_phone, q.items, q.discount, q.shipping, q.channel_id,
          case when q.delivery_days is not null then current_date + q.delivery_days end,
          q.notes, q.created_by)
  returning id into new_order;

  update quotes set status = 'convertido', approved_at = now(), order_id = new_order where id = q.id;
  return 'aprovado';
end $$;

revoke execute on function public.get_public_quote(text) from public;
revoke execute on function public.approve_public_quote(text) from public;
grant execute on function public.get_public_quote(text) to anon, authenticated;
grant execute on function public.approve_public_quote(text) to anon, authenticated;
