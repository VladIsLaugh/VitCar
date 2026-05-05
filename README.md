# VitAuto Platform

Car auction platform monorepo built with Turborepo, Next.js 15, and NestJS.

## Structure

```
vitauto/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   └── api/          # NestJS backend
├── packages/
│   └── shared-types/ # Shared TypeScript types/interfaces/enums
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Quick Start (5 minutes)

### Prerequisites

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- Docker (for PostgreSQL + Redis)

### Setup

```bash
# Clone the repo
git clone https://github.com/vladislaugh/vitcar.git
cd vitcar

# Install all dependencies for all workspaces
pnpm install

# Start PostgreSQL + Redis
docker-compose up -d

# Copy and fill environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local   # if exists

# Run database migrations
pnpm db:migrate

# Run all apps in dev mode (web: :3000, api: :3001)
pnpm dev
```

### Individual apps

```bash
# Run only the frontend
pnpm --filter @vitauto/web dev

# Run only the backend
pnpm --filter @vitauto/api dev

# Build shared types only
pnpm --filter @vitauto/shared-types build
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages via Turborepo |
| `pnpm type-check` | Type-check all packages |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting without writing |
| `pnpm clean` | Remove all build artifacts |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio (GUI on :5555) |
| `pnpm db:generate` | Regenerate Prisma Client |
| `pnpm db:reset` | Reset database and re-run migrations |

## Database (Docker)

```bash
# Start PostgreSQL + Redis
docker-compose up -d

# Check services
docker-compose ps

# Stop (data preserved)
docker-compose stop

# Stop and wipe all data
docker-compose down -v
```

## Packages

### `@vitauto/shared-types`

Shared TypeScript types used by both frontend and backend:
- `auth.types.ts` — User, Auth tokens, Login/Register DTOs
- `lot.types.ts` — Car lot, auction types, filters
- `order.types.ts` — Orders, payments, shipping

Import in any app:
```typescript
import { User, CarLot, Order } from '@vitauto/shared-types';
```

## Commit Convention

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) and are enforced by commitlint:

```
feat(auth): add Google OAuth login
fix(calculator): correct customs duty formula
chore(deps): update next.js to 15.1.0
CAR-29 feat(setup): init monorepo with Turborepo   ← Jira smart commit
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `revert`

## CI/CD

### PR Pipeline (`.github/workflows/ci.yml`)

Runs on every PR to `main`. Jobs run in parallel where possible:

| Job | What it does |
|-----|-------------|
| `lint` | `pnpm lint` — ESLint across all workspaces |
| `type-check` | `pnpm type-check` — TypeScript across all workspaces |
| `build` | `pnpm build` — full monorepo build (runs after lint + type-check pass) |

### Deploy Pipeline (`.github/workflows/deploy.yml`)

Runs on every push to `main`:
- **API** → deploys to Railway via Railway CLI
- **Web** → deploys automatically via Vercel GitHub integration (no action needed)
- **Smoke test** → `curl` to `/api/health` after Railway deploy

### Required GitHub Secrets

Add these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `RAILWAY_TOKEN` | Railway API token — get from Railway dashboard → Account Settings → Tokens |
| `RAILWAY_SERVICE_ID` | Railway service ID for the API — get from Railway project → service settings |
| `API_URL` | Production API base URL, e.g. `https://api.vitauto.com` |
| `NEXT_PUBLIC_API_URL` | Public API URL used during Next.js build, e.g. `https://api.vitauto.com` |

### Branch Protection (main)

Configure in **Settings → Branches → Add rule** for `main`:
- ✅ Require status checks to pass: `Lint`, `Type Check`, `Build`
- ✅ Require branches to be up to date before merging
- ✅ Require pull request reviews before merging
