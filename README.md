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

### Setup

```bash
# Clone the repo
git clone https://github.com/vladislaugh/vitcar.git
cd vitcar

# Install all dependencies for all workspaces
pnpm install

# Build all packages (shared-types first, then apps)
pnpm run build

# Run all apps in dev mode
pnpm run dev
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
| `pnpm lint` | Lint all packages |
| `pnpm type-check` | Type-check all packages |
| `pnpm clean` | Remove all build artifacts |

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
