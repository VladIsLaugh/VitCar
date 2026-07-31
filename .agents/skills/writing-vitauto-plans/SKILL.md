---
name: writing-vitauto-plans
description: Use when writing an implementation plan for a VitAuto feature - wraps superpowers writing-plans and enforces the project plan template (phases, propagation points, decisions) required by docs/way-of-working.md stage 4
whenToUse: When the user has an approved design and asks to write a plan, or when stage 4 of the way-of-working flow is reached
---

# Writing VitAuto Plans

First invoke the superpowers `writing-plans` skill and follow it. This skill only adds the VitAuto-specific contract on top.

## Output

`docs/plans/YYYY-MM-DD-<slug>-plan.md` (design doc from brainstorming lives alongside it as `...-design.md`).

## Required structure

```markdown
# <Feature> — Implementation Plan

**Roadmap:** <PREFIX>-NN · **Jira:** CAR-<epic-id> · **Design:** docs/plans/<date>-<slug>-design.md

## Decisions

<!-- "We chose X over Y" for every load-bearing choice (formula, auth flow, schema shape).
     Rationale dies in the design archive if it's not captured here. -->

## Phase 1 — <name>

<!-- Exact file paths, complete code examples, verification steps per phase.
     With ONE Jira Story per Epic, these phases ARE the work breakdown — no handwaving. -->

## Phase 2 — ...

## Propagation points

<!-- REQUIRED. Every category listed or explicitly None. Missing section = bounced at plan review. -->

- **Shared types (`packages/shared-types/`):** new/changed DTOs or enums — or `None`
- **Prisma schema (`apps/api/prisma/schema.prisma`):** models/fields, migration, seed data (`pnpm db:seed`) — or `None`
- **i18n (`apps/web/messages/uk.json` + `en.json`):** new keys in BOTH files (`pnpm check:i18n` gates CI) — or `None`
- **Calculator engine:** `CalculationSettings` rates, settingsSnapshot impact, formula change (cross-check CAR-56 spec) — or `None`
- **Notifications:** new `NotificationService.notify` event, email/Telegram templates — or `None`
- **Scraper:** bidfax field mapping, cron impact — or `None`
- **AGENTS.md / docs:** architecture decisions, business rules, commands that change — or `None`
- **Env vars / deploy:** `.env.example`, Vercel/Railway config — or `None`

## Verification

<!-- Exact commands: pnpm test / lint / type-check / check:i18n / build, plus manual smoke steps -->
```

## VitAuto invariants the plan must respect

- All rates in DB (`CalculationSettings`), never hardcoded; each `Calculation` stores a `settingsSnapshot`.
- `carAge = Math.max(currentYear - carYear, 1)`; excise computed in EUR, converted via NBU rate.
- `serviceFee`, `seaMarkup`, `repairPrice` are in totals but never in the client breakdown.
- Shared DTOs only in `packages/shared-types`; no `any`; strict TS.
- No hardcoded UI strings — next-intl keys in both locale files.
- Destructive prisma commands (`migrate reset`, `db push --force-reset`) are local-Docker-only.

## After writing

Run superpowers `requesting-code-review` on the plan (stage 5), then open the markdown approval PR (stage 6). Jira Stories are created only after that PR merges.

$ARGUMENTS
