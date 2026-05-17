# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

**RRHH Intranet** — A recruitment management system (HR SaaS) built with Next.js 16, React 19, and Supabase.

Two main modules:
- **CRM**: Kanban pipeline for managing candidates across 5 recruitment stages (persisted in Supabase)
- **Cotizador**: A fee calculator for search-based recruitment services

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

Required environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## Architecture

### Stack

- **Next.js** (App Router only — no `pages/` directory); TypeScript 5 strict mode; path alias `@/*` → root
- **Auth**: Supabase Auth (email/password), SSR mode with middleware
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Styling**: Tailwind CSS v4 via PostCSS (`@import "tailwindcss"` syntax); no component library

### Middleware & Route Protection

Route protection lives in `proxy.ts` (exported as `proxy()`, not `middleware`). For Next.js to enforce it, a root `middleware.ts` must import and re-export it as `middleware`. **If `middleware.ts` is missing, protected routes are publicly accessible.** Protected paths: `/crm`, `/cotizador`. Authenticated users at `/` are redirected to `/crm`.

- `lib/supabase/middleware.ts` — `updateSession()` refreshes the Supabase session cookie and returns `{ supabaseResponse, user }`
- `lib/supabase/client.ts` — browser-side client
- `lib/supabase/server.ts` — server-side client (Server Components, uses `next/headers` cookies)
- Protected routes live in `app/(protected)/` with their own layout (sidebar + content wrapper)

### Database Schema (`supabase/schema.sql`)

Four tables: `empresas`, `vacantes`, `candidatos`, `candidatos_vacantes` (N:M join).  
Three ENUMs: `vacante_estado`, `candidato_estado`, `etapa_pipeline`.  
All tables: RLS with authenticated-users-only full-access policy; `updated_at` auto-trigger.  
TypeScript types in `types/index.ts` — `Database` interface plus convenience aliases (`EmpresaRow`, `VacanteRow`, etc.).

The `etapa_pipeline` enum has 6 values (`prospecto` → `contratado` + `descartado`), but the Kanban board only renders 5 columns — `descartado` is intentionally excluded from `COLUMNAS` in `CRMShell`.

### Server Actions & Business Logic

- Server Actions are co-located with routes (e.g., `app/(protected)/cotizador/actions.ts`)
- `calcularAction()` validates input then delegates to `lib/cotizador/calculator.ts`
- The calculator is pure business logic: 5 salary levels (Operativo → Ejecutivo). Formula: `costoPuesto = COSTO_BASE * factor`, `precio = round(costoPuesto / (1 - 0.30))`. `COSTO_BASE` = 30,950 / 8 ≈ 3,869 MXN. Salary is used only to pick the level; it does not appear in the price formula.
- IT classification (`'Ingeniería / TI'`) overrides the `nivel` label via keyword matching on the job title — the salary-derived `factor` and `garantia` remain unchanged.

### Components

All components are `'use client'`:

| Component | Role |
|-----------|------|
| `components/auth/LoginForm.tsx` | Form state + Supabase `signIn` |
| `components/layout/Sidebar.tsx` | Navigation + `signOut` |
| `components/cotizador/CotizadorForm.tsx` | `useTransition` + server action integration |
| `components/crm/CRMShell.tsx` | Kanban board; reads/writes `candidatos` and `candidatos_vacantes` via Supabase client |

`CRMShell` fetches pipeline data with a joined query on mount and persists stage changes immediately via optimistic `setCards` + `supabase.update()`.

### Styling

CSS variables defined in `globals.css`: `--background: #f8f9fa`, `--foreground: #111827`, `--sidebar-width: 220px`.  
Sidebar is `fixed top-0 left-0`; main content uses `ml-[220px]` offset.  
Currency output uses `Intl.NumberFormat` with `es-MX` locale for MXN formatting.
