# VitAuto — Claude Code Context

## Project

Platform for importing cars from US auctions (Copart/IAAI) to Ukraine. Full-cycle: selection → purchase → shipping → customs → restoration → registration.

**Monorepo:** `apps/web` (Next.js 15) + `apps/api` (NestJS) + `packages/shared-types`

---

## Claude Code Config

`.claude/` configures Claude Code behavior for this project:

| File                         | Purpose                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `settings.json`              | Allowed/denied commands + hook registration                                |
| `hooks/check-i18n-parity.sh` | PostToolUse — validates uk.json ↔ en.json key parity on every file save    |
| `hooks/protect-database.sh`  | PreToolUse — blocks destructive DB ops when DATABASE_URL points to Railway |
| `mcp.json`                   | Atlassian Jira MCP server (read tickets, transition status, add comments)  |
| `skills/nestjs-module.md`    | Scaffold pattern for new NestJS modules with VitAuto conventions           |

**One-time setup:** add to your local `.env` (gitignored):

```
ATLASSIAN_EMAIL=your-email@domain.com
ATLASSIAN_API_TOKEN=<token from id.atlassian.com/manage-profile/security/api-tokens>
```

---

## Tech Stack

| Layer         | Technology                                                                |
| ------------- | ------------------------------------------------------------------------- |
| Frontend      | Next.js 15 (App Router), React 19, TypeScript                             |
| Styling       | Tailwind CSS v4 (`@theme` block, NOT tailwind.config.js)                  |
| Components    | shadcn/ui (copied into `components/ui/`, Radix-based)                     |
| Font          | Inter (via `next/font/google`, variable `--font-inter`)                   |
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
├── .claude/                      # Claude Code config (settings, hooks, mcp, skills)
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
- See `.claude/skills/nestjs-module.md` for the full scaffold pattern

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
- Add keys to BOTH `uk.json` and `en.json` — the PostToolUse hook will catch parity errors immediately
- Run `pnpm check-translations` at root to verify key parity (55 keys as of CAR-5 epic)

**Routing — always use hooks from `@/i18n/routing`, NOT `next/navigation`:**

```typescript
// ✅ Correct — locale-aware, typed to routing config
import { useRouter, usePathname, Link } from '@/i18n/routing';

// ❌ Wrong — bypasses locale prefix handling
import { useRouter, usePathname } from 'next/navigation';
```

`i18n/routing.ts` is the single source of truth. It exports `routing` (for middleware/request config) and the locale-aware navigation hooks.

**Language switch with cookie persistence:**

```typescript
document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
router.push(pathname, { locale: newLocale });
```

**Formatting — two layers:**

| Use case         | API                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| Client Component | `useFormatter()` from `next-intl`, or `formatAmount/formatNumber/formatDate` from `@/lib/formatters` |
| Server Component | async helpers from `@/lib/formatters.server` (wraps `getFormatter()`)                                |

**Intl.NumberFormat gotcha:** On Node.js 22 + this runtime, `uk` locale formats USD as `"8 500 USD"` (symbol after, regular space separator) — not `"$8 500"` with narrow no-break space. Never assert exact Intl strings in tests; use `toContain` for the meaningful parts.

**Currency store:** `useCurrencyStore` in `stores/currency.store.ts` — Zustand `persist` to localStorage key `vitauto-currency`. Add a mounted guard in components to prevent SSR hydration mismatch.

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

## Environments

| Environment    | Frontend                             | API                                               | Deploy trigger     |
| -------------- | ------------------------------------ | ------------------------------------------------- | ------------------ |
| **production** | https://vit-car.vercel.app           | https://vitauto-api-production.up.railway.app/api | push to `main`     |
| **stage**      | Vercel preview for `phase-*`         | https://vitauto-api-stage.up.railway.app/api      | push to `phase-*`  |
| **dev**        | Vercel preview (auto URL per branch) | https://vitauto-api-dev.up.railway.app/api        | push to `claude/*` |

Each environment has its own Railway service, PostgreSQL database, and Redis instance.
`APP_ENV` variable is set per service (`production` / `stage` / `dev`) and surfaced at `GET /api/health`.

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

## Environments

| Environment    | Frontend                             | API                                               | Deploy trigger     |
| -------------- | ------------------------------------ | ------------------------------------------------- | ------------------ |
| **production** | https://vit-car.vercel.app           | https://vitauto-api-production.up.railway.app/api | push to `main`     |
| **stage**      | Vercel preview for `phase-*`         | https://vitauto-api-stage.up.railway.app/api      | push to `phase-*`  |
| **dev**        | Vercel preview (auto URL per branch) | https://vitauto-api-dev.up.railway.app/api        | push to `claude/*` |

Each environment has its own Railway service, PostgreSQL database, and Redis instance.
`APP_ENV` variable is set per service (`production` / `stage` / `dev`) and surfaced at `GET /api/health`.

---

## Jira

Project: `CAR` at `vladvit19.atlassian.net`

Commit format links automatically: `CAR-29 feat(setup): init monorepo`

Current sprints:

- Sprint 1 (ends May 14): Foundation — monorepo, NestJS, Next.js, CI/CD, design tokens, i18n, header/footer ✅
- Sprint 2 (starts May 14): Auth + Landing + Calculator Engine

**Testing:** Vitest is configured in `apps/web`. Run `pnpm test` inside `apps/web` or `pnpm test --filter=@vitauto/web` from root.
