-- Etapa 6: permitir que el alumno borre su propio resultado (para "Deshacer" el ausente).
-- Pegar y correr en Supabase → SQL Editor.

drop policy if exists "alumno_borra_su_resultado" on public.resultados;
create policy "alumno_borra_su_resultado" on public.resultados
  for delete
  using (auth.uid() = alumno_id or public.is_coach());
