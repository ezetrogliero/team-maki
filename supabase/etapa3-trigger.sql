-- TEAM MAKI — Etapa 3: crear perfil automáticamente cuando alguien inicia sesión por primera vez
-- Pegar esto en Supabase → SQL Editor → New query → Run (una sola vez)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, rol)
  values (
    new.id,
    coalesce(split_part(new.email, '@', 1), 'Alumno'),
    'alumno'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
