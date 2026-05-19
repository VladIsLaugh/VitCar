# VitAuto — Cars from USA Auctions, Turnkey

Platform for importing cars from US auctions (Copart / IAAI) to Ukraine. Full cycle: selection → purchase → shipping → customs → restoration → registration.

## Live URLs

| Service           | URL                                      |
| ----------------- | ---------------------------------------- |
| Frontend (Vercel) | https://vit-car.vercel.app               |
| API (Railway)     | https://vitcar-production.up.railway.app |
| API health check  | `GET /api/health`                        |

---

## Quick Start (5 minutes)

### Prerequisites

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- Docker (for PostgreSQL + Redis)

```bash
# 1. Clone
git clone https://github.com/vladislaugh/vitcar.git
cd vitcar

# 2. Install all workspace dependencies
pnpm install

# 3. Start PostgreSQL + Redis
docker-compose up -d

# 4. Copy environment files and fill in secrets (see Environment Variables below)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 5. Run database migrations and start everything
pnpm db:migrate && pnpm dev
# web → http://localhost:3000   api → http://localhost:3001
```

---

## Project Structure

```
vitauto/
├── apps/
│   ├── web/                          # Next.js 15 frontend
│   │   ├── app/[locale]/             # i18n routing (uk / en)
│   │   │   ├── (public)/             # Landing, calculator, cars catalog
│   │   │   └── (dashboard)/         # Authenticated: garage, saved, finance
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui components (copy-in, Radix-based)
│   │   │   ├── layout/               # Header, Footer, Sidebar
│   │   │   └── landing/              # HeroSection, FAQ, etc.
│   │   ├── lib/                      # api-client.ts, utils.ts, formatters.ts
│   │   ├── stores/                   # Zustand client state
│   │   ├── messages/                 # uk.json, en.json (i18n strings)
│   │   ├── sentry.client.config.ts   # Sentry browser init
│   │   ├── sentry.server.config.ts   # Sentry Node init (SSR)
│   │   └── sentry.edge.config.ts     # Sentry Edge runtime init
│   │
│   └── api/                          # NestJS backend
│       ├── src/
│       │   ├── instrument.ts         # Sentry init — must be first import
│       │   ├── main.ts               # Bootstrap (port, CORS, global pipes)
│       │   ├── app.module.ts         # Root module
│       │   ├── common/
│       │   │   ├── decorators/       # @CurrentUser(), @Roles()
│       │   │   ├── filters/          # HttpExceptionFilter (Sentry 5xx)
│       │   │   ├── interceptors/     # LoggingInterceptor, AuditInterceptor
│       │   │   └── pipes/            # Custom validation pipes
│       │   ├── config/               # configuration.ts (env schema)
│       │   └── modules/
│       │       ├── auth/             # JWT + Google OAuth
│       │       ├── users/            # User CRUD
│       │       ├── calculator/       # Customs calculation engine
│       │       ├── health/           # GET /api/health
│       │       └── debug/            # Sentry test endpoints (dev/staging only)
│       └── prisma/
│           └── schema.prisma         # DB schema
│
└── packages/
    └── shared-types/                 # DTOs and enums shared by web + api
        └── src/
            ├── auth.types.ts
            ├── lot.types.ts
            └── order.types.ts
```

---

## Tech Stack

| Layer          | Technology                                         |
| -------------- | -------------------------------------------------- |
| Frontend       | Next.js 15 (App Router), React 19, TypeScript      |
| Styling        | Tailwind CSS v4 (`@theme` block), shadcn/ui, Radix |
| State          | Zustand (client), TanStack Query (server)          |
| Forms          | react-hook-form + zod                              |
| i18n           | next-intl — locales: `uk` (default), `en`          |
| Backend        | NestJS 11, TypeScript, Passport.js                 |
| ORM            | Prisma 6                                           |
| Database       | PostgreSQL 16                                      |
| Cache / Queues | Redis 7 + BullMQ                                   |
| Auth           | JWT (15 min, in-memory) + HttpOnly cookie (30 d)   |
| Email          | Resend                                             |
| Notifications  | Telegram Bot API                                   |
| Monitoring     | Sentry (API + Web)                                 |
| Hosting        | Vercel (web) + Railway (api + db + redis)          |
| Build          | Turborepo + pnpm workspaces                        |

---

## Available Scripts

Run from the repo root unless otherwise noted.

| Command             | Description                                        |
| ------------------- | -------------------------------------------------- |
| `pnpm dev`          | Start all apps in development mode (web + api)     |
| `pnpm build`        | Build all packages and apps via Turborepo          |
| `pnpm lint`         | ESLint across all workspaces                       |
| `pnpm type-check`   | `tsc --noEmit` across all workspaces               |
| `pnpm format`       | Format all files with Prettier                     |
| `pnpm format:check` | Check formatting without writing                   |
| `pnpm clean`        | Remove all `dist/` and `.next/` build artifacts    |
| `pnpm db:migrate`   | `prisma migrate dev` — apply and create migrations |
| `pnpm db:studio`    | Open Prisma Studio GUI on `:5555`                  |
| `pnpm db:generate`  | Regenerate Prisma Client after schema changes      |
| `pnpm db:reset`     | Reset DB and re-run all migrations (wipes data)    |
| `pnpm db:seed`      | Seed with auction fees + city delivery data        |
| `pnpm test`         | Run Jest unit tests                                |

Run a single workspace:

```bash
pnpm --filter @vitauto/web dev
pnpm --filter @vitauto/api dev
pnpm --filter @vitauto/shared-types build
```

---

## Environment Variables

### `apps/api/.env`

Copy from `apps/api/.env.example`.

| Variable               | Required | Description                                                         |
| ---------------------- | -------- | ------------------------------------------------------------------- |
| `PORT`                 | No       | HTTP port (default: `3001`; Railway sets this automatically)        |
| `NODE_ENV`             | Yes      | `development` or `production`                                       |
| `DATABASE_URL`         | Yes      | PostgreSQL connection string — Railway links this automatically     |
| `REDIS_URL`            | Yes      | Redis connection string — Railway links this automatically          |
| `JWT_ACCESS_SECRET`    | Yes      | Random secret for access tokens — generate: `openssl rand -hex 32`  |
| `JWT_REFRESH_SECRET`   | Yes      | Random secret for refresh tokens — generate: `openssl rand -hex 32` |
| `FRONTEND_URL`         | Yes      | Allowed CORS origin, e.g. `https://vit-car.vercel.app`              |
| `GOOGLE_CLIENT_ID`     | No       | Google OAuth app client ID (required for Google login)              |
| `GOOGLE_CLIENT_SECRET` | No       | Google OAuth app secret                                             |
| `RESEND_API_KEY`       | No       | Resend API key for transactional email                              |
| `SENTRY_DSN`           | No       | Sentry DSN for API error tracking (only sends in production)        |

### `apps/web/.env.local`

Copy from `apps/web/.env.example`.

| Variable                 | Required | Description                                                       |
| ------------------------ | -------- | ----------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`    | Yes      | API base URL, e.g. `http://localhost:3001/api` or Railway URL     |
| `NEXT_PUBLIC_SENTRY_DSN` | No       | Sentry DSN for frontend error tracking (only sends in production) |
| `SENTRY_ORG`             | No       | Sentry org slug — required for source map uploads during build    |
| `SENTRY_PROJECT`         | No       | Sentry project name, e.g. `vitauto`                               |
| `SENTRY_AUTH_TOKEN`      | No       | Sentry auth token — get from Sentry → Settings → Auth Tokens      |

---

## Git Workflow

### Branch naming

```
feature/CAR-123-short-description    # new feature
fix/CAR-456-fix-calculation-bug      # bug fix
chore/CAR-789-update-dependencies    # maintenance
```

### Commit format (enforced by commitlint)

```
CAR-123 feat(scope): short description
CAR-123 fix(auth): handle expired refresh token
CAR-123 chore(deps): update prisma to 6.x
```

Types: `feat` · `fix` · `refactor` · `test` · `chore` · `docs` · `perf` · `ci`

The `CAR-123` prefix is required and enables **Jira smart commits** — the ticket is linked automatically when you push.

### PR flow

1. Branch off the active sprint branch (currently `phase-0`)
2. Open a **draft PR** while work is in progress
3. CI runs lint + type-check + build on every push
4. Mark ready for review when CI is green
5. Merge into the sprint branch (squash merge)

### Jira smart commits

Smart commits let you transition Jira tickets directly from your commit message:

```bash
# Link a commit to a ticket (status stays unchanged)
git commit -m "CAR-29 feat(setup): init turbo monorepo"

# Move ticket to In Progress
git commit -m "CAR-29 #in-progress feat(setup): wip monorepo"

# Move ticket to Done
git commit -m "CAR-29 #done feat(setup): turbo monorepo complete"
```

**Setup (one-time, done by project owner):**

1. In Jira → **Project Settings → Integrations → GitHub**
2. Connect the `VladIsLaugh/VitCar` repository
3. After connection, every push with a `CAR-NNN` prefix will appear on the Jira ticket automatically

---

## Deployment

### Vercel (Next.js frontend)

1. [vercel.com/new](https://vercel.com/new) → Import `VladIsLaugh/VitCar`
2. **Root Directory**: `apps/web`
3. **Framework**: Next.js (auto-detected)
4. **Build / Output**: leave blank — `vercel.json` handles both
5. **Environment Variables** — add at minimum:
   - `NEXT_PUBLIC_API_URL` = Railway API URL
   - `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`

Every push to `phase-0` / `main` triggers a production deploy. Every PR gets a unique preview URL.

### Railway (NestJS API + PostgreSQL + Redis)

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub → `VladIsLaugh/VitCar`
2. Add **PostgreSQL** and **Redis** plugins — Railway sets `DATABASE_URL` and `REDIS_URL` automatically
3. In the API service Variables, add:

   | Variable             | Value                          |
   | -------------------- | ------------------------------ |
   | `NODE_ENV`           | `production`                   |
   | `JWT_ACCESS_SECRET`  | `openssl rand -hex 32`         |
   | `JWT_REFRESH_SECRET` | `openssl rand -hex 32`         |
   | `FRONTEND_URL`       | Vercel production URL          |
   | `SENTRY_DSN`         | Sentry DSN for the API project |

4. First deploy — run migrations once from your local machine:
   ```bash
   DATABASE_URL="<railway-postgres-url>" pnpm --filter=api migrate:prod
   ```

### GitHub Secrets (CI/CD)

Add in **Settings → Secrets and variables → Actions**:

| Secret                | How to get it                                                           |
| --------------------- | ----------------------------------------------------------------------- |
| `RAILWAY_TOKEN`       | Railway → Account Settings → Tokens                                     |
| `RAILWAY_SERVICE_ID`  | Railway project → API service → Settings → Service ID                   |
| `API_URL`             | Railway API public URL, e.g. `https://vitcar-production.up.railway.app` |
| `NEXT_PUBLIC_API_URL` | Same as `API_URL`                                                       |

---

## CI/CD Pipelines

### PR pipeline (`.github/workflows/ci.yml`)

Runs on every PR. Jobs run in parallel:

| Job          | What it checks                                     |
| ------------ | -------------------------------------------------- |
| `lint`       | ESLint across all workspaces                       |
| `type-check` | TypeScript across all workspaces                   |
| `build`      | Full monorepo build (runs after lint + type-check) |

### Deploy pipeline (`.github/workflows/deploy.yml`)

Runs on every push to `main`:

- API → Railway (via Railway CLI)
- Web → Vercel (automatic via GitHub integration)
- Smoke test → `curl GET /api/health` after Railway deploy

---

## Troubleshooting

### PostgreSQL won't start

```bash
# Check if port 5432 is already in use
lsof -i :5432

# Remove old container and volume, then restart
docker-compose down -v
docker-compose up -d
```

### `pnpm install` fails with lockfile error

```bash
# Regenerate the lockfile
pnpm install --no-frozen-lockfile
```

### Prisma Client not found / out of sync

```bash
# Regenerate after any schema change
pnpm db:generate

# If migrations are out of sync with schema
pnpm db:reset      # warning: wipes all local data
```

### NestJS `nest: command not found` during build

Make sure you are installing dev dependencies. In local dev this should not happen. On Railway, `nixpacks.toml` uses `--prod=false` to include devDependencies (like `@nestjs/cli`) during the build phase.

### `ERR_PNPM_NO_LOCKFILE` in CI

The `pnpm-lock.yaml` must be committed. Run `pnpm install` locally and commit the lockfile.

### Port already in use

```bash
# Find and kill the process on port 3001 (api) or 3000 (web)
lsof -ti :3001 | xargs kill -9
lsof -ti :3000 | xargs kill -9
```

### CORS errors in browser

Check that `FRONTEND_URL` in `apps/api/.env` exactly matches the origin your browser is using (including protocol and port).

### `next-intl` middleware redirect loop

Ensure `NEXT_PUBLIC_API_URL` does not end with a trailing slash, and that `middleware.ts` matcher excludes `_next/`, `api/`, and static assets.
