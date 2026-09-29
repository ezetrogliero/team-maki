-- TEAM MAKI — Arregla el bucle infinito en las reglas de seguridad de "profiles"
-- Pegar en Supabase → SQL Editor → New query → Run (una sola vez)

-- Función que chequea "¿es coach?" saltándose las reglas de seguridad
-- (evita que la regla se pregunte a sí misma en bucle)
create or replace function public.is_coach()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and rol = 'coach'
  );
$$;

drop policy if exists "ver_propio_perfil" on profiles;
create policy "ver_propio_perfil" on profiles
  for select using (auth.uid() = id or public.is_coach());

drop policy if exists "coach_administra_perfiles" on profiles;
create policy "coach_administra_perfiles" on profiles
  for all using (public.is_coach());
