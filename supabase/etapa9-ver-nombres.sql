-- TEAM MAKI — permite que cualquier alumno vea el nombre de sus compañeros
-- (hoy solo la coach podía verlos, por eso en el ranking el alumno veía "—")
-- Pegar en Supabase → SQL Editor → New query → Run (una sola vez)

drop policy if exists "ver_propio_perfil" on profiles;
create policy "ver_perfiles" on profiles
  for select using (true);

-- Nota: esto hace que cualquier usuario logueado pueda ver nombre, email y rol
-- de todos los perfiles (no solo el propio). Para un grupo chico donde ya se
-- conocen entre todos no es un problema; si en algún momento quieren ocultar
-- los emails del resto, se puede separar en una vista aparte.
