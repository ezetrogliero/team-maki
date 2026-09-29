-- Etapa 5: onboarding del alumno (nombre + RM) antes de ver el entrenamiento.
-- Pegar y correr en Supabase → SQL Editor.

alter table public.profiles add column if not exists onboarded boolean not null default false;

-- Tu perfil de coach ya está completo, no necesita pasar por el onboarding.
update public.profiles set onboarded = true where rol = 'coach';

-- Los perfiles de alumno que ya existen (de las pruebas) quedan en onboarded = false
-- a propósito: la próxima vez que entren van a pasar por la pantalla de nombre + RM,
-- así se corrige el nombre (hoy quedó como el mail) y quedan con su RM cargado.
