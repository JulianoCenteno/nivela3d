-- =====================================================================
-- Nivela 3D — Compras avulsas (order bumps, upsells)
-- Alimentada pelo webhook da plataforma. Chaveada por e-mail, como as assinaturas.
-- =====================================================================
create table if not exists public.purchases (
  id          bigint generated always as identity primary key,
  email       text not null,
  product     text not null,             -- código interno: bump_mockups, bump_etiquetas...
  status      text not null default 'active' check (status in ('active','refunded')),
  external_id text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (email, product)
);
create index if not exists purchases_email_idx on public.purchases (lower(email));

alter table public.purchases enable row level security;
drop policy if exists "own purchases" on public.purchases;
create policy "own purchases" on public.purchases
  for select using (lower(email) = lower((select auth.jwt()) ->> 'email'));
-- Inserção/alteração só pelo service role (webhook).
