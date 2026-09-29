-- Etapa 4: tabla de RM (récord máximo) por alumno y ejercicio.
-- Pegar y correr en Supabase → SQL Editor.

create table if not exists public.rms (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references auth.users(id) on delete cascade,
  lift text not null,
  valor_kg numeric not null,
  updated_at timestamptz not null default now(),
  unique (alumno_id, lift)
);

alter table public.rms enable row level security;

drop policy if exists "rms_select" on public.rms;
create policy "rms_select" on public.rms
  for select
  using (auth.uid() = alumno_id or public.is_coach());

drop policy if exists "rms_insert" on public.rms;
create policy "rms_insert" on public.rms
  for insert
  with check (auth.uid() = alumno_id or public.is_coach());

drop policy if exists "rms_update" on public.rms;
create policy "rms_update" on public.rms
  for update
  using (auth.uid() = alumno_id or public.is_coach());
