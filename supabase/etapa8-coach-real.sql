-- Etapa 8: hacer coach a la coach real por su email.
-- Solo funciona si ella ya entró alguna vez a team-maki.vercel.app y pidió el link
-- (aunque no lo haya abierto), porque recién ahí se crea su fila en profiles.
-- Si da "0 rows affected", es porque todavía no entró ni una vez: que pida el link
-- primero y después corré esto.
-- Pegar y correr en Supabase → SQL Editor.

update public.profiles
set rol = 'coach', onboarded = true
where email = 'macarenafanchini@gmail.com';
