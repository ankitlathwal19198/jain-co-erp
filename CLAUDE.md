# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Repository Layout

Monorepo with two independent npm projects:

- `frontend/` — Next.js 16 app (App Router, TypeScript, Tailwind CSS v4, Turbopack, ESLint 9). Source under `frontend/src/`, alias `@/* → src/*`.
- `backend/` — NestJS 11 app (TypeScript, Express platform, Jest). Source under `backend/src/`, entrypoint `src/main.ts`.

No root `package.json`, no workspaces. Each project installs and runs independently.

---

## ⚠️ Important: Next.js 16 Caveat

This version has breaking changes vs. older training data. **Before editing any frontend code**, consult `frontend/node_modules/next/dist/docs/` for current APIs. Do **not** rely on memory of Next 13/14/15 patterns.

`frontend/AGENTS.md` (loaded via `frontend/CLAUDE.md`) restates this rule for agents that scope their context to the frontend project.

---

## Ports

| Service       | Port  | Notes                                    |
|---------------|-------|------------------------------------------|
| Frontend dev  | 3000  | `npm run dev`                            |
| Backend HTTP  | 8000  | Set in `backend/src/main.ts`; override with `PORT` env var |

Frontend talks to backend via `NEXT_PUBLIC_API_URL` (see `frontend/.env.local`, defaults to `http://localhost:8000`).

CORS, `helmet`, `cookie-parser` and a global `ValidationPipe` are already wired in `backend/src/main.ts`. The dev origin `http://localhost:3000` is the default; override via the `ALLOWED_ORIGIN` env var. Backend env is loaded from `backend/.env` via `dotenv/config`.

---

## Common Commands

### Frontend (`cd frontend`)

```bash
npm run dev        # Next dev server on :3000
npm run build      # Production build
npm run start      # Serve built app
npm run lint       # ESLint
```

### Backend (`cd backend`)

```bash
npm run start:dev      # Nest dev w/ watch on :8000
npm run start          # Run once
npm run start:debug    # Watch + --inspect
npm run build          # Compile to dist/
npm run start:prod     # node dist/main
npm run lint           # ESLint --fix
npm run format         # Prettier write
npm run test           # Jest (unit, *.spec.ts)
npm run test:watch
npm run test:cov
npm run test:e2e       # Jest with test/jest-e2e.json
```

Run a single test file:

```bash
cd backend
npx jest path/to/file.spec.ts
npx jest -t "test name pattern"
```

**Frontend tests:** no runner configured yet. Add Vitest (recommended for Next 16) or Jest before writing tests; do not assume `npm test` works in `frontend/`. No `*.spec.tsx` files exist on the frontend yet; backend has one Nest sample (`app.controller.spec.ts`).

---

## Backend Architecture

### Module Structure

Standard Nest module tree rooted at `AppModule` (`src/app.module.ts`), bootstrapped in `src/main.ts` via `NestFactory.create(AppModule)`.

Add new features as Nest modules using the **Controller → Service → Module** pattern and import into `AppModule`.

**File layout per feature:**

```
src/
  feature/
    feature.controller.ts   # Route handlers only — no business logic
    feature.service.ts      # Business logic, injected via DI
    feature.module.ts       # Imports/exports/providers declaration
    feature.dto.ts          # Input validation shapes (class-validator)
    feature.entity.ts       # DB entity / domain model
    feature.spec.ts         # Unit tests (service layer)
```

### Database (Prisma + Postgres)

- ORM is **Prisma 7** (`backend/prisma/schema.prisma`).
- Provider: `postgresql`, datasource url = `$DATABASE_URL`. A `backend/jain-co-erp.sqlite` file exists from an earlier experiment — ignore it.
- `PrismaModule` (`src/prisma/prisma.module.ts`) exposes `PrismaService`. Inject `PrismaService` instead of `new`ing a client.
- Models (`schema.prisma`):
  - **RBAC:** `Role`, `Permission`, `RolePermission` (M:N join). `User.roleId` → `Role`. There is **no** `admin | user` enum anymore — roles are data, not enum values.
  - **User:** `id` uuid, `email` unique, `password` bcrypt hash, optional `empId` (unique) / `name` / contact + reporting fields. Self-relation `reportingManagerId` → `manager` / `directReports`.
  - **Task delegation:** `Task` (recurring, `frequency` enum) → `TaskOccurrence` (one per planned date, `@@unique([taskId, plannedDate])`) → `TaskExtensionRequest`. Enums: `TaskPriority`, `TaskFrequency`, `TaskStatus`, `OccurrenceStatus`, `ExtensionStatus`.
- A legacy `src/users/schemas/user.schema.ts` survives from a TypeORM scaffold; auth code does **not** use it. Treat as dead until removed.
- Migration `20260526102433_add_ticket_system` exists but the ticket models were dropped from `schema.prisma`. The frontend `lib/permissions.ts` still lists `TICKETS_*` codes that the backend catalog (`permissions.catalog.ts`) does **not** seed — known drift; do not rely on ticket permissions backend-side.

**Commands (from `backend/`):**

```bash
npx prisma migrate dev --name <slug>   # create + apply migration in dev
npx prisma migrate deploy              # apply pending migrations in prod
npx prisma generate                    # regen client after schema edits
npx prisma studio                      # browser GUI
```

Env: `DATABASE_URL=postgresql://…` in `backend/.env`. Loaded by `dotenv/config` at the top of both `src/main.ts` and `prisma.config.ts`.

### Auth Flow (cookie-based JWT)

- `auth/auth.module.ts` wires `@nestjs/jwt` + `passport-jwt` + `passport-local` + `PrismaModule`.
- Strategy: `auth/strategies/jwt.strategy.ts` reads the token from an httpOnly cookie.
- Guard: `auth/guards/jwt-auth.guard.ts` — apply with `@UseGuards(JwtAuthGuard)` on protected controllers/handlers.
- `JwtStrategy.validate` calls `UsersService.loadAuthenticated(sub)` to build the request `user` as `AuthenticatedUser` (`authenticated-user.type.ts`): `{ id, email, name, roleId, roleName, permissions: string[], isSuperAdmin }`. The flattened `permissions` array is what guards check.
- Endpoints (`auth/auth.controller.ts`):
  - `POST /auth/register` — creates a user with bcrypt-hashed password.
  - `POST /auth/login` — sets `Set-Cookie: access_token=…; HttpOnly`.
  - `POST /auth/refresh` — re-issues the access cookie.
  - `POST /auth/logout` — clears the cookie.
  - `GET /auth/me` — guarded; returns the current `AuthenticatedUser`.
- Frontend mirror: `frontend/src/services/auth.service.ts` calls these endpoints via `lib/api/client.ts` (`withCredentials: true`). `context/AuthProvider.tsx` hydrates `user` by calling `/auth/me` on mount; `useAuth()` exposes `hasPermission(code | code[])`.

### Authorization (RBAC) — backend

Permission enforcement is **separate** from authentication. Pattern:

- `permissions/permissions.catalog.ts` — single source of truth: `PERMISSIONS` map (`module:action` strings, e.g. `tasks:view_all`), `PERMISSION_CATALOG`, the `SuperAdmin` / `Member` role names, and `SEED_USERS`.
- `@RequirePermissions(PERMISSIONS.X, …)` (`require-permissions.decorator.ts`) tags handlers/controllers.
- `PermissionsGuard` (`permissions.guard.ts`) reads the metadata, **bypasses every check when `user.roleName === SuperAdmin`**, else requires `every` listed code to be in `user.permissions`. Apply it alongside `JwtAuthGuard`.
- `SeedService` (`seed/seed.service.ts`, `OnModuleInit`) upserts the catalog, the `SuperAdmin` role (granted all permissions) + `Member` role, and promotes/creates the `SEED_USERS` as SuperAdmins on every boot. Add a new permission by editing the catalog — the seed wires it on next start.

### Domain Modules (current)

All except `auth`/`register` are guarded by `JwtAuthGuard` + `PermissionsGuard`.

| Module | Controller routes | Notes |
|--------|-------------------|-------|
| `users` | `GET /users`, `GET /users/lookup`, `GET /users/next-emp-id`, `GET/POST/PATCH/DELETE /users[/:id]` | `loadAuthenticated()` builds the request user for JWT strategy. |
| `roles` | `GET/POST/PATCH/DELETE /roles[/:id]` | System roles (`isSystem`) should not be deleted. |
| `permissions` | `GET /permissions` | Returns the catalog for the role editor UI. |
| `tasks` | `POST/GET/PATCH/DELETE /tasks[/:id]`, `POST /tasks/:id/start`, `GET /tasks/occurrences/today`, `POST /tasks/occurrences/:id/{resolve,reopen}`, `POST /tasks/occurrences/:id/extensions`, `PATCH /tasks/extensions/:id` | Recurring delegation engine. |
| `reports` | `GET /reports/doer-performance` | Aggregates occurrence on-time/delay stats per assignee; non-SuperAdmin is scoped to own data. |

**Recurring tasks:** `tasks.service.ts` + `recurrence.util.ts` (UTC-day math, `startOfUtcDay`) materialize `TaskOccurrence` rows from a `Task`'s `frequency`/`initialPlannedDate`, tracking `lastGeneratedThrough`. `TasksScheduler` (`@Cron(EVERY_DAY_AT_MIDNIGHT)`, via `@nestjs/schedule`) calls `materializeRecurringOccurrences()` nightly. `ScheduleModule.forRoot()` must stay registered in `AppModule`.

### SOLID Principles (Backend)

| Principle | Rule |
|-----------|------|
| **S** — Single Responsibility | Each service does one thing. Split large services by domain. |
| **O** — Open/Closed | Extend behavior via new classes/modules; avoid modifying existing services. |
| **L** — Liskov Substitution | Program to interfaces; injectable alternatives must honor the same contract. |
| **I** — Interface Segregation | Define narrow `interface` types per consumer; avoid fat interfaces. |
| **D** — Dependency Inversion | Always inject dependencies via constructor; never `new` a service inside another. |

### Security Checklist (Backend)

The block below is already wired in `backend/src/main.ts` — keep it intact when refactoring. Items in **Additional security rules** (throttler, dedicated logger, etc.) remain TODO:

```ts
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // Cookie parsing (if using session/refresh tokens)
  app.use(cookieParser());

  // Global input validation & sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,          // Auto-cast to DTO types
    }),
  );

  // CORS — restrict in production
  app.enableCors({
    origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 8000);
}
```

**Additional security rules:**
- Never log secrets, passwords, or tokens. Use a logger service, not `console.log`.
- Store all secrets in environment variables; never hardcode them.
- Use `class-validator` decorators on every DTO (`@IsString()`, `@IsEmail()`, etc.).
- Validate and sanitize all user-supplied input before it reaches the database.
- Use parameterized queries / ORM methods — never raw string-interpolated SQL.
- Apply rate-limiting (`@nestjs/throttler`) on public endpoints.
- Hash passwords with `bcrypt` (cost factor ≥ 12); never store plaintext.

### TypeScript Config Notes

`tsconfig.json` uses `module: nodenext` / `moduleResolution: nodenext`.  
Do **not** reintroduce `baseUrl` (deprecated in TS 5.5+ without `paths`).

---

## Frontend Architecture

### Directory Structure

```
src/
  app/                        # Next.js App Router pages & layouts
  components/
    ui/                       # Pure, reusable UI primitives (no data fetching)
    features/                 # Feature-specific composite components
  hooks/                      # Custom hooks (useDebounce, useLocalStorage, etc.)
  lib/
    api/                      # Axios/fetch clients — one file per resource
    queryKeys.ts              # Centralized React Query key factory
  providers/                  # All context providers composed here
  context/                    # React Context definitions (see below)
  types/                      # Shared TypeScript interfaces & types
  utils/                      # Pure utility functions (no side effects)
```

Tailwind v4 via `@tailwindcss/postcss` — config lives in CSS, no `tailwind.config.js`.  
TypeScript path alias: `@/*` → `src/*`.

### Installed Packages

`@tanstack/react-query`, `@tanstack/react-query-devtools`, `zod`, `react-hook-form`, `@hookform/resolvers`, `axios`. Do **not** reinstall or substitute alternatives without a reason.

### Already Scaffolded (do not recreate)

```
src/
  app/layout.tsx                 # Root layout wraps children in <AppProviders>
  providers/
    QueryProvider.tsx            # QueryClient + Devtools (dev only)
    index.tsx                    # AppProviders = Query > Auth > Theme
  context/
    AuthContext.ts               # AuthUser, AuthContextValue, createContext
    AuthProvider.tsx             # login/logout stubs — wire to backend
    ThemeContext.ts              # 'light' | 'dark'
    ThemeProvider.tsx            # persists to localStorage, sets data-theme
  hooks/
    useAuth.ts                   # guarded consumer
    useTheme.ts                  # guarded consumer
  lib/
    api/client.ts                # axios apiClient, withCredentials: true
    queryKeys.ts                 # key factory
    schemas/auth.ts              # zod loginSchema + LoginInput type
```

When adding a new context: follow the three-file pattern shown above (Context type file, Provider file, consumer hook) and register the provider in `src/providers/index.tsx`.

### Layout Shell

Authenticated pages render inside `<DashboardShell title subtitle>` (`src/components/layout/DashboardShell.tsx`), which composes:

- `Sidebar.tsx` — fixed 256px sidebar (lg+), grouped nav (Overview / Operations / Insights / System), active state via `usePathname()`.
- `Topbar.tsx` — page title + subtitle, global search, notifications, settings, user menu with logout. Uses `useAuth()` and shows `user.name ?? user.email`.

New authenticated pages should mount through `DashboardShell` rather than re-implementing chrome.

### Authorization (RBAC) — frontend

- `lib/permissions.ts` — `PERMISSIONS` code map + `SUPER_ADMIN_ROLE` (frontend mirror; see backend drift note above).
- `useAuth()` exposes `hasPermission(code | code[])`; SuperAdmin short-circuits to true.
- `components/auth/Can.tsx` — `<Can perm={…} fallback={…}>` conditionally renders children. Prefer this over inline permission checks in JSX.
- `components/auth/RoutePermissionGuard.tsx` — wraps page content to gate whole routes.
- Feature data flows through `services/*.service.ts` (axios) → `hooks/use*.ts` (React Query). Pages under `app/dashboard/{tasks,users,roles,reports}` consume those hooks; never fetch in the page directly.

### Contexts (beyond the scaffold)

`ConfirmDialogContext` / `ConfirmDialogProvider` + `useConfirm()` follow the same three-file pattern and are registered in `providers/index.tsx`. Use `await confirm({…})` for destructive-action confirmations instead of `window.confirm`.

### Loaders

- `components/ui/Loader.tsx` — inline spinner. Props: `size: 'sm' | 'md' | 'lg'`, `tone: 'primary' | 'on-primary'`, optional `label`. Use `on-primary` when placed on a blue background (e.g. inside a `bg-primary` button).
- `components/ui/PageLoader.tsx` — full-screen branded loader. Use for client-side auth gates and as a Suspense fallback.
- Route-level loaders already exist at `app/loading.tsx`, `app/login/loading.tsx`, `app/dashboard/loading.tsx`; Next.js wires these into navigation suspense automatically. New routes only need their own `loading.tsx` if a custom label is required.

### Env Vars

`frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Anything `NEXT_PUBLIC_*` ships to the browser — never put secrets there.

---

### State Management Strategy

Use the right tool for the right scope:

| State Type            | Tool                        |
|-----------------------|-----------------------------|
| Server / async data   | **React Query** (`@tanstack/react-query`) |
| Shared UI/app state   | **React Context** (see below) |
| Local component state | `useState` / `useReducer`   |
| URL / navigation state | Next.js `useSearchParams`, `useRouter` |
| Form state            | `react-hook-form` + `zod`   |

---

### React Query — Rules & Conventions

#### Setup (`src/providers/QueryProvider.tsx`)

```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,      // 1 min default freshness
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

#### Query Key Factory (`src/lib/queryKeys.ts`)

Centralize all keys to avoid typos and enable targeted invalidation:

```ts
export const queryKeys = {
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
    list: (filters: Record<string, unknown>) => ['users', 'list', filters] as const,
  },
  posts: {
    all: ['posts'] as const,
    detail: (id: string) => ['posts', id] as const,
  },
} as const;
```

#### Custom Query Hooks (`src/hooks/useUsers.ts`)

Encapsulate all React Query logic in named hooks — **never** call `useQuery` directly inside a component:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchUsers, createUser } from '@/lib/api/users';

export function useUsers(filters = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => fetchUsers(filters),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
```

#### Rules

- **Co-locate** query hooks with the feature they belong to (`src/hooks/` or `src/features/*/hooks/`).
- **Never** put `fetch` calls inside components. Always go through an API lib function.
- Prefer **optimistic updates** (`onMutate` / `onError` rollback) for user-facing mutations.
- Use `suspense: true` + React Suspense boundaries for loading states when appropriate.
- Define **error boundaries** at the route level to catch query errors.

---

### React Context — Rules & Conventions

Context is for **shared UI or session state** — not for server data (that's React Query's job).

#### When to use Context

- Auth/session state (current user, roles, token)
- Theme / color-mode preference
- Locale / i18n
- Feature flags
- Global modal / toast state

#### Context Pattern

Each context must follow this three-file pattern:

**`src/context/AuthContext.ts`** — type definitions only:

```ts
import { createContext } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
```

**`src/context/AuthProvider.tsx`** — implementation:

```tsx
'use client';
import { useState, useCallback } from 'react';
import { AuthContext, AuthContextValue, AuthUser } from './AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call API; set user from response
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value: AuthContextValue = { user, isLoading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

**`src/hooks/useAuth.ts`** — typed consumer hook:

```ts
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
```

#### Rules

- **Never** consume `useContext(SomeContext)` directly in a component. Always use the named hook (`useAuth`, `useTheme`, etc.) — this enforces the guard clause.
- Keep context values **stable**: wrap functions in `useCallback`, objects in `useMemo`.
- **Split contexts** by domain; never put unrelated state in one provider.
- Compose all providers in a single `src/providers/index.tsx` and wrap the root layout once.

#### Provider Composition (`src/providers/index.tsx`)

```tsx
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from '@/context/AuthProvider';
import { ThemeProvider } from '@/context/ThemeProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
```

---

### SOLID Principles (Frontend)

| Principle | Application |
|-----------|-------------|
| **S** — Single Responsibility | One component = one concern. Split when a component fetches *and* renders *and* handles form state. |
| **O** — Open/Closed | Extend components via props/composition; avoid forking existing components. |
| **L** — Liskov Substitution | Custom hooks must fulfil the same contract as the base hook they wrap. |
| **I** — Interface Segregation | Define narrow prop interfaces; avoid giant `props` objects. Use `Pick<>` / `Omit<>`. |
| **D** — Dependency Inversion | Components depend on hooks/interfaces, not on specific API calls directly. |

### Security Checklist (Frontend)

- **Never** store JWT access tokens in `localStorage`. Use `httpOnly` cookies (set by the backend).
- **Never** expose secrets in `.env` files prefixed with `NEXT_PUBLIC_` unless they are truly public.
- Sanitize all user-generated content rendered as HTML (use `DOMPurify` before `dangerouslySetInnerHTML`).
- Validate all form inputs with `zod` schemas before submitting.
- Use Next.js [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware) for auth-guarded routes.
- Set strict `Content-Security-Policy` headers in `next.config.ts`.
- Avoid `any` — use strict TypeScript types everywhere.

---

## General Coding Standards

- **TypeScript strict mode** is on in both projects. No `any`, no `@ts-ignore` without a justification comment.
- **No magic strings/numbers** — extract into named constants or enums.
- **Error handling** — every async operation must have an explicit error path. Unhandled promise rejections are bugs.
- **Immutability** — prefer `const`, `readonly`, and non-mutating array/object methods.
- **Pure functions** — utility functions in `utils/` must have no side effects.
- **Tests** — new services and hooks must ship with unit tests. Aim for ≥ 80 % coverage on business logic.
- **PR hygiene** — lint and format (`npm run lint && npm run format`) must pass before committing.


## Color Theme — Jainco Buildcon ERP

### Primary
- `--color-primary: #2563EB`          /* Blue — buttons, links, active states */
- `--color-primary-dark: #1D4ED8`     /* Hover / pressed */
- `--color-primary-light: #3B82F6`    /* Accents, highlights */
- `--color-brand-navy: #1E3A5F`       /* Logo mark, headings on dark */

### Background & Surface
- `--color-bg-page: #E8F0FE`          /* Right panel / hero blue tint */
- `--color-bg-card: #FFFFFF`          /* Login card, modals */
- `--color-bg-input: #F1F5F9`         /* Input field fill */
- `--color-bg-overlay: #2563EB26`     /* Blue overlay (15% opacity) */

### Typography
- `--color-text-heading: #0F172A`     /* Page titles, bold labels */
- `--color-text-body: #374151`        /* Form labels, body copy */
- `--color-text-muted: #6B7280`       /* Subtitles, "Smart ERP Solutions" */
- `--color-text-on-primary: #FFFFFF`  /* Text on blue backgrounds */

### Borders & Dividers
- `--color-border: #E2E8F0`           /* Default input / card border */
- `--color-border-hover: #CBD5E1`     /* Focused / hovered borders */
- `--color-border-active: #2563EB`    /* Active input ring */

### Interaction States
- button background:        #2563EB  → hover: #1D4ED8
- toggle active track:      #2563EB
- link / forgot password:   #2563EB
- input focus ring:         2px solid #2563EB40

### Typography Scale (observed)
- Brand tagline:  11px, uppercase, letter-spacing 0.08em, #6B7280
- Page heading:   28–32px, weight 700, #0F172A
- Form label:     14px, weight 500, #374151
- Input text:     14–15px, weight 400, #0F172A
- Button text:    15px, weight 600, #FFFFFF
- Link text:      14px, weight 500, #2563EB

### Border Radius
- Cards / modals:  16px
- Buttons:         10px
- Inputs:          8px
- Toggles:         full (pill)

### Using the Palette in Code

Color tokens are declared in `frontend/src/app/globals.css` inside `@theme inline`. Tailwind v4 auto-generates utilities from each `--color-*` token:

- Backgrounds: `bg-primary`, `bg-primary-dark`, `bg-primary-light`, `bg-navy`, `bg-page`, `bg-card`, `bg-input`, `bg-overlay`
- Text: `text-heading`, `text-body`, `text-muted`, `text-on-primary`, `text-primary`
- Borders: `border-line`, `border-line-hover`, `border-line-active`

Use these utilities everywhere in app chrome (sidebar, topbar, dashboard, modals, forms). Do **not** reach for raw Tailwind palette names like `slate-*`, `indigo-*`, `emerald-*`, `amber-*` outside the marketing splash on `/login`, which keeps the original gradient + skyline artwork.