-- Etapa 5: onboarding del alumno (nombre + RM) antes de ver el entrenamiento.
-- Pegar y correr en Supabase → SQL Editor.

alter table public.profiles add column if not exists onboarded boolean not null default false;

-- Tu perfil de coach ya está completo, no necesita pasar por el onboarding.
update public.profiles set onboarded = true where rol = 'coach';

-- Los perfiles de alumno que ya existen (de las pruebas) quedan en onboarded = false
-- a propósito: la próxima vez que entren van a pasar por la pantalla de nombre + RM,
-- así se corrige el nombre (hoy quedó como el mail) y quedan con su RM cargado.

-- BUG REAL encontrado: hasta ahora ningún alumno podía guardar su propio nombre,
-- porque la única regla de "update" sobre profiles exigía ser coach. Por eso el
-- onboarding fallaba silenciosamente. Se agrega el permiso para que cada uno
-- pueda actualizar su propia fila (sin poder auto-asignarse el rol de coach).
drop policy if exists "alumno_actualiza_su_perfil" on public.profiles;
create policy "alumno_actualiza_su_perfil" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id and rol = 'alumno');
