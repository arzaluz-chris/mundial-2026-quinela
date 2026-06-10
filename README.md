# Mundial 2026 Quiniela

Quinela para el Mundial 2026 de la FIFA.

Aplicacion privada para una quiniela de la Copa Mundial FIFA 2026. Incluye auth con Supabase, predicciones bloqueadas al kickoff, visibilidad comunitaria despues del inicio de cada partido, scoring automatico y leaderboard.

## Stack

- Next.js 15, React, TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, RLS
- Deploy esperado: Vercel

## Configuracion local

1. Instala dependencias:

```bash
npm install
```

2. Copia variables:

```bash
cp .env.example .env.local
```

3. Llena `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4. Aplica migraciones en Supabase. Con Supabase CLI local:

```bash
supabase start
supabase db reset
```

Para aplicar al proyecto remoto vinculado:

```bash
supabase db push
supabase db query --linked --file supabase/seed/seed.sql
```

5. Corre la app:

```bash
npm run dev
```

## Modelo de seguridad

- Todas las tablas tienen RLS habilitado.
- `profiles`: usuarios autenticados pueden leer perfiles; cada usuario actualiza solo su perfil. El rol solo lo puede cambiar un admin.
- `matches`: todos los usuarios autenticados leen; solo admins escriben.
- `predictions`: antes del kickoff solo el dueño lee y edita; despues del kickoff todos leen. Nadie puede modificar predicciones ajenas.
- `leaderboard`: todos leen; se actualiza mediante la funcion server-side `recalculate_leaderboard()`, que exige admin.

## Scoring

- Marcador exacto: 5 puntos.
- Ganador y diferencia correctos: 3 puntos.
- Ganador correcto: 1 punto.
- Incorrecto: 0 puntos.

El scoring existe en `lib/scoring.ts` para UI/tests y en SQL dentro de la funcion `public.prediction_points` para el calculo autoritativo.

## Admin

Para convertir un usuario en admin, actualiza su perfil desde Supabase SQL editor:

```sql
update public.profiles
set role = 'admin'
where email = 'tu-email@example.com';
```

Luego entra a `/admin`.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
```
