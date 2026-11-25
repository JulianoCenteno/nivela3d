create table if not exists public.funnel_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  step text not null check (step in ('upsell','downsell')),
  event text not null check (event in ('view','yes','no')),
  locale text,
  funnel text,
  visitor text
);
create index if not exists funnel_events_created_idx on public.funnel_events (created_at);
alter table public.funnel_events enable row level security;
create policy "anon can insert funnel events" on public.funnel_events
  for insert to anon, authenticated
  with check (char_length(coalesce(funnel,'')) <= 40 and char_length(coalesce(visitor,'')) <= 64 and char_length(coalesce(locale,'')) <= 5);
