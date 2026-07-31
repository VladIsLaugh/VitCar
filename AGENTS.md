# VitAuto — Agent Context

## Project

Platform for importing cars from US auctions (Copart/IAAI) to Ukraine. Full-cycle: selection → purchase → shipping → customs → restoration → registration.

**Monorepo:** `apps/web` (Next.js 15) + `apps/api` (NestJS) + `packages/shared-types`

---

## Tooling

- Claude Code config lives in `.claude/` (skills, hooks, MCP servers) and is used by Claude Code sessions.
- Kimi Code (and other agentic tools) read this `AGENTS.md` as the project context.
- `CLAUDE.md` is a pointer to this file — keep `AGENTS.md` as the single source of truth.
- Superpowers workflow skills (brainstorming, TDD, systematic-debugging, writing-plans, etc.) plus the `llm-council` decision-debate skill are installed at user level (`~/.agents/skills/`). See `docs/superpowers-usage.md` for triggers and examples. Project rules in this file take precedence over any skill's generic advice.
- The team's delivery process (roadmap → Jira Epic → brainstorm → plan → plan review → Story → PR → squash merge → acceptance) is defined in `docs/way-of-working.md`. Follow it for any feature work.
- Project-scope skills for that flow live in `.agents/skills/` (committed): `working-a-jira-ticket`, `roadmap-jira-linking`, `brainstorming-vitauto`, `writing-vitauto-plans`, `merging-prs`, `closing-an-epic`. Generic workflow skills (superpowers) are user-level.

---

## Commands

```bash
# Install all workspaces
pnpm install

# Start everything locally
docker-compose up -d   # PostgreSQL + Redis
pnpm dev               # web: 3000, api: 3001

# Build
pnpm build             # all packages via Turborepo
pnpm build --filter=web
pnpm build --filter=api

# Quality
pnpm lint
pnpm type-check        # tsc --noEmit in all apps
pnpm test              # jest
pnpm check:i18n        # verify uk.json / en.json top-level key parity

# Database
pnpm db:migrate        # prisma migrate dev
pnpm db:studio         # Prisma Studio on :5555
pnpm db:seed           # seed with auction fees + cities data
pnpm db:reset          # prisma migrate reset
```

---

## Tech Stack

| Layer         | Technology                                                                |
| ------------- | ------------------------------------------------------------------------- |
| Frontend      | Next.js 15 (App Router), React 19, TypeScript                             |
| Styling       | Tailwind CSS v4 (`@theme` block, NOT tailwind.config.js)                  |
| Components    | shadcn/ui (copied into `components/ui/`, Radix-based)                     |
| Font          | Geist (via `next/font/google`, NOT Inter)                                 |
| State         | Zustand (client state), TanStack Query (server state)                     |
| Forms         | react-hook-form + zod                                                     |
| i18n          | next-intl, locales: `uk` (default), `en`, URLs: `/uk/...` `/en/...`       |
| Backend       | NestJS, TypeScript, Prisma ORM                                            |
| Database      | PostgreSQL 16                                                             |
| Cache         | Redis 7                                                                   |
| Queues        | BullMQ (on Redis)                                                         |
| Auth          | JWT (15min access in memory) + HttpOnly cookie refresh (30d), Passport.js |
| Email         | Resend                                                                    |
| Notifications | Telegram Bot API                                                          |
| Monitoring    | Sentry                                                                    |
| Hosting       | Vercel (web) + Railway (api + db + redis)                                 |

---

## Project Structure

```
vitauto/
├── .claude/                    # Claude Code config
├── AGENTS.md                   # agent-agnostic project context (Kimi Code + others)
├── apps/
│   ├── web/                      # Next.js
│   │   ├── app/[locale]/         # i18n routing
│   │   │   ├── (public)/         # landing, calculator, cars
│   │   │   └── (dashboard)/      # authenticated: garage, saved, finance
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui (DO NOT edit directly — wrap instead)
│   │   │   ├── layout/           # Header, Footer, Sidebar
│   │   │   └── landing/          # HeroSection, FAQ, etc.
│   │   ├── lib/                  # api-client.ts, utils.ts, formatters.ts
│   │   ├── stores/               # Zustand stores
│   │   └── messages/             # uk.json, en.json (i18n keys)
│   └── api/                      # NestJS
│       └── src/
│           └── modules/          # auth, users, calculator, orders, lots, scraper
└── packages/
    └── shared-types/             # DTOs and enums shared between web and api
```

---

## Code Conventions

### TypeScript

- `strict: true` everywhere
- Shared types in `packages/shared-types` — never duplicate DTOs
- No `any` — use `unknown` and narrow

### Git commits (required for Jira smart commits)

```
CAR-123 feat(scope): description
CAR-123 fix(auth): handle expired refresh token
CAR-123 chore(deps): update prisma to 5.x
```

Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`

### NestJS patterns

- One module per feature (`auth`, `users`, `calculator`, etc.)
- DTOs with `class-validator` decorators
- `@CurrentUser()` decorator for authenticated user
- `@Roles('ADMIN')` + `RolesGuard` for authorization
- All mutations auto-logged via `AuditInterceptor`
- When creating a new NestJS module, follow the scaffold pattern in `.claude/skills/nestjs-module.md`

### Next.js patterns

- Server Components by default — add `'use client'` only when needed
- `generateMetadata()` for dynamic SEO metadata
- `revalidate = 600` for ISR on lot detail pages
- No `localStorage` for auth tokens — access token in memory only

### Tailwind v4

```css
/* Correct — use CSS variables in @theme block */
@theme {
  --color-primary: #0a2540;
  --color-accent: #10b981;
}

/* Wrong — no tailwind.config.js theme extension */
```

### i18n

- All UI strings via `useTranslations()` (client) or `getTranslations()` (server)
- Never hardcode Ukrainian or English text in JSX
- Add keys to BOTH `uk.json` and `en.json` — CI will fail otherwise

---

## Safety Rules

- NEVER run `prisma migrate reset`, `prisma db push --force-reset`, `DROP TABLE`, `DROP DATABASE`, or `TRUNCATE` when `DATABASE_URL` points to a remote host (`railway.app` / `railway.internal`). These are allowed only against the local Docker database.
- After editing `apps/web/messages/uk.json` or `en.json`, ALWAYS verify both files have identical top-level keys by running: `pnpm check:i18n`

---

## Architecture Decisions

**Auth flow:**

- Access token: in-memory React state (XSS protection)
- Refresh token: HttpOnly Secure SameSite=Lax cookie
- On 401: axios interceptor auto-calls `/auth/refresh`, retries request
- Middleware checks cookie presence only (not JWT validity — server does that)

**Calculation Engine (critical):**

- All rates in DB (`CalculationSettings`), never hardcoded
- Each `Calculation` stores a `settingsSnapshot` — changing rates never affects past calculations
- Excise is calculated in EUR then converted to USD via NBU rate
- `carAge = Math.max(currentYear - carYear, 1)` — minimum 1, never 0
- `serviceFee` and `seaMarkup` are company margins — included in total but NOT shown in client breakdown
- Full formula spec: see Jira CAR-56

**Notifications:**

- Single `NotificationService.notify(userId, eventType, payload)` — fans out to in-app + email + Telegram based on user settings
- Delivery via BullMQ queues (async, with retry)

**Lots catalog:**

- Historical sold lots only ([bidfax.info](http://bidfax.info) scraper)
- Scraper runs daily via BullMQ cron at 10:00 Kyiv
- `carSize = 'small' | 'big'` affects sea shipping price only — not land delivery
- Land delivery uses `cityData.C` (car) or `cityData.M` (motorcycle, future)

---

## Environment Variables

See `.env.example` in each app. Required before running:

**`apps/api/.env`:**

```
DATABASE_URL
REDIS_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
RESEND_API_KEY
SENTRY_DSN
FRONTEND_URL=http://localhost:3000
```

**`apps/web/.env.local`:**

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN
```

---

## Roles

```
Guest → Client → Manager → Admin
```

- `Guest`: calculator, catalog (no save)
- `Client`: dashboard, garage, saved, finance
- `Manager`: admin panel (orders only), cannot change settings
- `Admin`: full access including calculator settings, user roles, content

---

## Key Business Rules

- **Customs base** = `lotPrice + $1,500` (CIF: insurance + packaging)
- **Duty**: 0% electric, 10% all others
- **EV excise** (2026): 1 EUR/kWh battery capacity; **Hybrid**: fixed €100; **Petrol**: €50–100/L × age; **Diesel**: €75–150/L × age
- **VAT**: 20% on all types including EV (exemption removed Jan 2026)
- **Pension fund** (at registration, not customs): 3% / 4% / 5% based on car value in UAH; 0% for EV
- **repairPrice**: entered by manager after inspection — never shown to client in calculator
- **serviceFee** ($500): hidden company fee, set in admin panel

---

## Jira

Project: `CAR` at `vladvit19.atlassian.net`

Commit format links automatically: `CAR-29 feat(setup): init monorepo`

Current sprints:

- Sprint 1 (active): Foundation — monorepo, NestJS, Next.js, CI/CD, Vercel deploy, design tokens
- Sprint 2 (next): Auth + Landing + Calculator Engine
