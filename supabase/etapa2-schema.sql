-- TEAM MAKI — esquema inicial de base de datos (Etapa 2)
-- Pegar esto completo en Supabase → SQL Editor → New query → Run

-- Alumnos y coach (perfil extendido sobre el sistema de auth de Supabase)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol text not null default 'alumno' check (rol in ('alumno','coach')),
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

-- RM (récord máximo) actual de cada alumno por ejercicio
create table rm_actual (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references profiles(id) on delete cascade,
  ejercicio text not null,
  valor_kg numeric not null,
  actualizado_en timestamptz not null default now(),
  unique (alumno_id, ejercicio)
);

-- Historial de RM (para el gráfico de progreso)
create table rm_historial (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references profiles(id) on delete cascade,
  ejercicio text not null,
  valor_kg numeric not null,
  fecha date not null
);

-- Programación de cada día (Core / Warm up / Fuerza / WOD), la carga la coach
create table dias (
  id uuid primary key default gen_random_uuid(),
  fecha date not null unique,
  contenido jsonb not null,  -- guarda core, warm, fuerza y wod como estructura, igual que en la maqueta
  nota_coach text,
  creado_en timestamptz not null default now()
);

-- Resultados que carga cada alumno por día
create table resultados (
  id uuid primary key default gen_random_uuid(),
  dia_id uuid not null references dias(id) on delete cascade,
  alumno_id uuid not null references profiles(id) on delete cascade,
  fuerza jsonb,
  wod jsonb,
  rm jsonb,
  nota text,
  ausente boolean not null default false,
  correccion_pedida text,
  creado_en timestamptz not null default now(),
  unique (dia_id, alumno_id)
);

-- Seguridad: cada alumno solo ve y edita lo suyo; la coach ve y edita todo
alter table profiles enable row level security;
alter table rm_actual enable row level security;
alter table rm_historial enable row level security;
alter table dias enable row level security;
alter table resultados enable row level security;

create policy "ver_propio_perfil" on profiles for select using (auth.uid() = id or exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'coach'));
create policy "coach_administra_perfiles" on profiles for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'coach'));

create policy "ver_dias" on dias for select using (true);
create policy "coach_administra_dias" on dias for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'coach'));

create policy "ver_rm" on rm_actual for select using (auth.uid() = alumno_id or exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'coach'));
create policy "alumno_o_coach_edita_rm" on rm_actual for all using (auth.uid() = alumno_id or exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'coach'));

create policy "ver_rm_hist" on rm_historial for select using (auth.uid() = alumno_id or exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'coach'));
create policy "alumno_o_coach_edita_rm_hist" on rm_historial for all using (auth.uid() = alumno_id or exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'coach'));

create policy "ver_resultados" on resultados for select using (true);
create policy "alumno_carga_su_resultado" on resultados for insert with check (auth.uid() = alumno_id);
create policy "alumno_o_coach_edita_resultado" on resultados for update using (auth.uid() = alumno_id or exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'coach'));
