-- TEAM MAKI — Etapa 3: guardar el email en el perfil (para que la coach vea el listado)
-- Pegar en Supabase → SQL Editor → New query → Run (una sola vez)

alter table profiles add column if not exists email text;

-- Completar el email de los perfiles que ya existen
update profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- A partir de ahora, guardar también el email cuando se crea el perfil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, rol, email)
  values (
    new.id,
    coalesce(split_part(new.email, '@', 1), 'Alumno'),
    'alumno',
    new.email
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;
