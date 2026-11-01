-- =====================================================================
-- Nivela 3D — Insumos (argolas, ímãs, parafusos, embalagens...)
-- Rode depois do 0001_init.sql.
-- =====================================================================
create table if not exists public.supplies (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  unit        text not null default 'un',
  unit_price  numeric(12,4) not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists supplies_user_idx on public.supplies(user_id);

alter table public.supplies enable row level security;
drop policy if exists "own rows" on public.supplies;
create policy "own rows" on public.supplies
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Insumos usados em cada produto: [{"supply_id": "...", "qty": 2}, ...]
alter table public.products add column if not exists supplies jsonb not null default '[]'::jsonb;

drop trigger if exists supplies_limit on public.supplies;
create trigger supplies_limit before insert on public.supplies
  for each row execute function enforce_plan_limits();
