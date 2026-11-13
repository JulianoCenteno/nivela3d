-- Profissional (Completo) e Empresa passam a ter impressoras e produtos ilimitados.
-- 100000 funciona como "ilimitado" no gatilho enforce_plan_limits.
create or replace function public.plan_limit(plan text, resource text) returns int
language sql immutable as $$
  select case plan
    when 'teste'        then case resource when 'printers' then 1      when 'products' then 30     end
    when 'iniciante'    then case resource when 'printers' then 1      when 'products' then 30     end
    when 'profissional' then case resource when 'printers' then 100000 when 'products' then 100000 end
    when 'empresa'      then case resource when 'printers' then 100000 when 'products' then 100000 end
    else 0
  end;
$$;
