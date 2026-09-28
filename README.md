# Team Maki

App de programación y seguimiento de entrenamientos para Team Maki (CrossFit).

## Stack

- Next.js (App Router)
- Supabase (base de datos + login por magic link)
- Vercel (hosting)

## Variables de entorno

En Vercel → Project Settings → Environment Variables, agregar:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

(los valores están en Supabase → Project Settings → API)

## Base de datos

Los scripts SQL están en `/supabase`. Se corren una sola vez, en orden, desde
Supabase → SQL Editor:

1. `etapa2-schema.sql` — tablas y seguridad
2. `etapa3-trigger.sql` — crea el perfil automáticamente al primer login

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con las claves reales
npm run dev
```
