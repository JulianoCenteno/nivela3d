-- Teste grátis de 24 horas para quem cria conta sem compra.
create or replace function public.trial_hours() returns int
language sql immutable as $$ select 24 $$;

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
      where p.id = uid and p.created_at > now() - make_interval(hours => trial_hours())),
    'nenhum'
  );
$$;
