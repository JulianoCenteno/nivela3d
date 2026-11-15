-- Despesas do negócio e metas do mês (faturamento e lucro).

create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  description text not null,
  category    text not null default 'outros',
  amount      numeric(12,2) not null check (amount >= 0),
  spent_at    date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists expenses_user_date_idx on public.expenses(user_id, spent_at desc);

alter table public.expenses enable row level security;
drop policy if exists "own rows" on public.expenses;
create policy "own rows" on public.expenses for all
  using (user_id = (select public.account_id()))
  with check (user_id = (select public.account_id()));

alter table public.settings add column if not exists goal_revenue numeric(12,2) not null default 0;
alter table public.settings add column if not exists goal_profit  numeric(12,2) not null default 0;
