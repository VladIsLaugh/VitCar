---
name: brainstorming-vitauto
description: Use before any feature/creative work in this repo - wraps superpowers brainstorming and enforces the VitAuto design-doc contract (docs/plans design file, decisions with rationale, propagation pre-scan) required by docs/way-of-working.md stage 3
whenToUse: When the user wants to build a feature, component, or behavior change and no approved design exists yet
---

# Brainstorming (VitAuto)

First invoke the superpowers `brainstorming` skill and follow it — collaborative dialogue, one question at a time, design approval before any implementation. This skill only adds the VitAuto-specific contract on top.

## Before the dialogue — read context (2 minutes)

- `AGENTS.md` — business rules, calculation-engine invariants, roles, tech constraints. The design must not violate these.
- The `docs/ROADMAP.md` entry and the Jira Epic description for this initiative (the `roadmap-jira-linking` output) — scope and why.
- Existing plans in `docs/plans/` touching the same domain — avoid re-designing settled ground.

## Questions the dialogue must cover

Beyond the superpowers skill's usual refinement, make sure these get answered:

- **Who sees it?** Guest / Client / Manager / Admin — role gates (`@Roles`) change the design.
- **Does it touch money?** Anything feeding the calculator must respect: rates in `CalculationSettings` only, `settingsSnapshot` on every `Calculation`, `carAge ≥ 1`, hidden margins (`serviceFee`, `seaMarkup`, `repairPrice`) never in the client breakdown.
- **Does it cross the web/api boundary?** Then DTOs/enums belong in `packages/shared-types`, not duplicated.
- **Does it need words?** All UI strings via next-intl in BOTH `uk.json` and `en.json`.
- **Does it notify?** New events go through the single `NotificationService.notify(userId, eventType, payload)` — no direct email/Telegram calls.
- **Does it need data?** Prisma schema change, seed data, or scraper field mapping?

## Output

`docs/plans/YYYY-MM-DD-<slug>-design.md`:

```markdown
# <Feature> — Design

**Roadmap:** <PREFIX>-NN · **Jira:** CAR-<epic-id or "requested (pending PO)">

## Problem

## Proposed design

## Decisions

<!-- "We chose X over Y, because Z" for every load-bearing choice.
     The plan and future devs read this — rationale dies without it. -->

## Alternatives considered

## Scope: in / out

## Propagation pre-scan

<!-- First pass at the plan's Propagation points: shared-types, Prisma,
     i18n, calculator engine, notifications, scraper, AGENTS.md/docs, env/deploy —
     list what's likely touched, or None. -->

## Open questions
```

## Hard gate

Do NOT write code, scaffold, or invoke implementation skills until the user has approved the design. Once approved: run `writing-vitauto-plans` (stage 4).

## Optional: council the design

For high-stakes tradeoffs (architecture 3+ modules depend on, pricing, scope-defining calls), offer to run the `llm-council` skill on the design before approval — its verdict feeds `## Decisions`.

$ARGUMENTS
