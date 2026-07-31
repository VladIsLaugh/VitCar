# VitAuto Way of Working

> 2-week sprints (Jira). AI-paced development. Pre-production.
> Audience: developers, AI agents, anyone planning VitAuto work.
> Adapted from the Smartflow way-of-working; board tooling mapped from Azure DevOps to Jira + GitHub.

## Principles

1. **Roadmap is strategic, plans are tactical, Jira issues are receipts.** The roadmap holds _why_, plans hold _how_, Jira issues hold _what merged_. Each layer answers one question and stops.
2. **Discipline lives in plans and reviews, not in ticket sprawl.** AI-paced dev makes coding fast; quality has to come from sharper design, not more granular tickets.
3. **Plans are not optional.** Every feature gets a brainstorming session and a plan before any Jira Story is scoped. Bugs are the only documented exception (see Bug Flow).
4. **Plans get reviewed before approval.** Spec-level bugs are 10× cheaper to fix in a markdown PR than in production code.
5. **Project rules beat skill defaults.** `AGENTS.md` (commit format, safety rules, i18n parity, calculation-engine invariants) always wins over any skill's generic advice.

---

## The Flow

```
   Idea
    │
    ▼
 ┌─────────────────────┐
 │ 1. Roadmap entry    │ docs/ROADMAP.md ### section
 └─────────────────────┘
    │
    ▼
 ┌─────────────────────┐
 │ 2. Jira Epic        │ CAR Epic — created by PO only; agent prepares payload
 └─────────────────────┘
    │
    ▼
 ┌─────────────────────┐
 │ 3. Brainstorming    │ brainstorming-vitauto skill  (mandatory)
 └─────────────────────┘
    │
    ▼
 ┌─────────────────────┐
 │ 4. Plan written     │ superpowers writing-plans skill  (mandatory)
 └─────────────────────┘
    │
    ▼
 ┌─────────────────────┐
 │ 5. Plan reviewed    │ superpowers requesting-code-review (mandatory)
 └─────────────────────┘
    │
    ▼
 ┌─────────────────────┐
 │ 6. Plan approved    │ Markdown PR merged into main (docs/plans/)
 └─────────────────────┘
    │
    ▼
 ┌─────────────────────┐
 │ 7. Story created    │ ONE Jira Story per Epic (max 2 for basket Epics)
 └─────────────────────┘
    │
    ▼
 ┌─────────────────────┐
 │ 8. Execution        │ Branching = your choice; commits start with CAR-<id>
 └─────────────────────┘
    │
    ▼
 ┌─────────────────────┐
 │ 9. PR + checks      │ One PR per Epic; squash commits reference CAR-<id>. CI green
 └─────────────────────┘
    │
    ▼
 ┌─────────────────────┐
 │ 10. Merge           │ Rebase on main, re-check Prisma migrations, retest, squash
 └─────────────────────┘
    │
    ▼
 ┌─────────────────────┐
 │ 11. Acceptance      │ User-facing: verify on deployed env (Vercel preview / Railway dev)
 └─────────────────────┘
    │
    ▼
 ┌─────────────────────┐
 │ 12. Story Done      │ Transition via smart commit or manually
 └─────────────────────┘
    │
    ▼
 ┌─────────────────────┐
 │ 13. Epic Done       │ All Stories Done + deployed + ROADMAP.md updated
 └─────────────────────┘
```

---

## Hierarchy

```
Epic     (Jira — quarter/sprint-scoped feature, e.g. "CAR: Auction lot catalog")
 └─ Story (Jira — ONE per Epic; max two for "basket" Epics; created after plan approval)
     └─ PR (GitHub — one PR per Epic; each Story squash-merges as one commit "CAR-<id> ...")

Bug      (Jira Bug — flat, no plan for trivial fixes; parent = most relevant Epic or the QA/tech Epic)
```

**One Story per Epic is the default.** A substantive feature like _Calculation Engine_ is one Story even when it spans Prisma schema, NestJS module, API, and UI — the plan's `## Phase N` headings are the breakdown, the board is just the receipt. **Up to 2 Stories only when the Epic is a "basket"** of loosely-related items (e.g. _UI Polish Pass_, _Misc Fixes_). More than 2 Stories under one Epic is the explicit anti-pattern this discipline is designed to prevent.

**No sub-task sprawl.** Jira sub-tasks are _not_ the work breakdown — the plan is. If you find yourself wanting sub-tasks to slice the work, your plan isn't detailed enough. Jira's sprint burndown uses Story estimates; put the estimate on the Story itself.

---

## Stage-by-stage

### 1. Roadmap entry

Use the `roadmap-jira-linking` skill (covers stages 1–2 together). Add a `### <ID> — Title :status: NN%` section to `docs/ROADMAP.md` (the skill creates the file if it doesn't exist yet). Status emoji: `:rocket:` (launch blocker), `:construction:` (in progress), `:triangular_ruler:` (designed), `:clipboard:` (planned), `:bulb:` (concept), `:white_check_mark:` (done). Use an ID prefix matching the domain (CALC, LOTS, AUTH, ADMIN, SCRAPE, etc.).

### 2. Jira Epic

**Only the Product Owner creates Epics.** Part of the `roadmap-jira-linking` skill: the dev/agent prepares a ready-to-paste Epic payload (title, description with roadmap ID + scope + plan reference) and hands it to the PO. The roadmap entry carries `**Jira:** requested (pending PO)` until the Epic exists; once the PO creates it, replace the marker with `**Jira:** CAR-<id>` and commit. Agents never create Epics directly.

### 3. Brainstorming

Run the `brainstorming-vitauto` skill (which wraps superpowers `brainstorming`) to refine the rough idea into a fully-formed design. Output: `docs/plans/YYYY-MM-DD-<slug>-design.md`. **Mandatory** for every feature; only bugs may skip.

> **Decision capture.** When the design includes "we chose X over Y" for a load-bearing decision (calculation formula, auth flow, scraper architecture — things other modules depend on), record the rationale in the plan itself under a `## Decisions` heading. The repo has no ADR practice yet; if it grows one, promote these.

### 4. Plan written

Run the `writing-vitauto-plans` skill (which wraps superpowers `writing-plans`) against the design. Output: `docs/plans/YYYY-MM-DD-<slug>-plan.md` with exact file paths, complete code examples, and verification steps. **The plan must be detailed enough to be the work order** — with one Story per Epic, the plan's phases _are_ the breakdown.

**Plans must include a `## Propagation points` section.** VitAuto features routinely touch coupled surfaces; surface them at plan review, not at code review. List every coupled surface, or explicitly `None` per category:

```markdown
## Propagation points

- **Shared types (`packages/shared-types/`):** new/changed DTOs or enums that both web and api consume — or `None`
- **Prisma schema (`apps/api/prisma/schema.prisma`):** new models/fields, migration needed, seed data (`pnpm db:seed`) — or `None`
- **i18n (`apps/web/messages/uk.json` + `en.json`):** new keys (BOTH files — `pnpm check:i18n` gates CI) — or `None`
- **Calculator engine:** settings snapshot impact, new rate in `CalculationSettings`, formula change (cross-check CAR-56 spec) — or `None`
- **Notifications:** new `NotificationService.notify` event type, email/Telegram templates — or `None`
- **Scraper:** bidfax field mapping changes, cron impact — or `None`
- **AGENTS.md / docs:** architecture decisions, business rules, or commands that change — or `None`
- **Env vars / deploy:** new entries for `.env.example`, Vercel/Railway config — or `None`
```

A plan that doesn't list propagation gets bounced at step 5. `None` everywhere is fine — it means the feature is genuinely self-contained.

### 5. Plan reviewed

**Mandatory:** run the superpowers `requesting-code-review` skill (or a human review) on the plan markdown before raising the approval PR. The reviewer explicitly verifies the `## Propagation points` section is present and credible. Document the review outcome in the PR description.

### 6. Plan approved

Approval gate is a **markdown PR** merging design + plan into `docs/plans/`. One approver is enough. Once merged, the plan is canonical — amendments go through another PR.

### 7. Story breakdown

Once the plan is merged, create the Story(s) on the Jira board under the Epic.

- **One Story per Epic — period — unless the Epic is a basket** (then split roughly in half, max 2).
- Story title: `<verb> <noun>`. Description: one or two sentences pointing at the plan (e.g. "Implements `docs/plans/2026-08-01-price-drop-alerts-plan.md`").
- Stories are created **after** plan approval, never before.
- Estimate goes on the Story (that's what the Jira sprint burndown charts).

### 8. Execution

- **Branching is your choice** — branch-per-phase, branch-per-feature, or the superpowers `using-git-worktrees` skill for isolation. No enforced naming; be predictable.
- **Every commit references the Story:** subject format `CAR-<id> <type>(<scope>): <description>` (per `AGENTS.md`; required for Jira smart commits). With one Story per Epic there is one squash commit on `main` per Story — that's the receipt.
- **Recommended execution pattern: superpowers `subagent-driven-development`** — fresh subagent per plan task, main agent reviews. `executing-plans` is the simpler alternative. `test-driven-development` is preferred for new code regardless.
- **VitAuto invariants while implementing:**
  - All rates in DB (`CalculationSettings`), never hardcoded; each `Calculation` stores a `settingsSnapshot`.
  - `carAge = Math.max(currentYear - carYear, 1)`.
  - `serviceFee` / `seaMarkup` / `repairPrice` are never shown in the client breakdown.
  - No `any`; shared DTOs live in `packages/shared-types`, never duplicated.
  - UI strings via next-intl in both locale files — never hardcoded text in JSX.

### 9. PR + checks

- **One PR per Epic**, opened against `main`. Each Story's branch squash-merges as a single commit whose message starts with `CAR-<id>`.
- PR title: `<type>(<scope>): <feature subject>` — no `CAR-<id>` in the title; traceability lives in commit messages.
- **CI gate** (`.github/workflows/ci.yml`): `pnpm lint`, `pnpm check:i18n`, `pnpm type-check`, `pnpm build`. All must be green. Note: CI does **not** run jest yet — run `pnpm test` locally before opening the PR.
- Run the superpowers `verification-before-completion` skill before requesting review — evidence before assertions.
- If you added behaviour, add a test for it in the same PR. CI green means "nothing regressed", not "your new behaviour works".

### 10. Merge

**Mandatory:** run the `merging-prs` skill before squash-merging. It enforces, in order:

1. **Rebase on `origin/main`.** GitHub's "no conflicts" is a textual check only — it doesn't detect a stale base silently reverting commits that landed during review.
2. **Re-check Prisma migrations.** If the branch touches `apps/api/prisma/schema.prisma` or `migrations/` and main moved meanwhile, regenerate the migration against current main (`pnpm db:migrate` on the rebased tree) so migration history stays linear. **Never** run `prisma migrate reset` / `db push --force-reset` against a remote `DATABASE_URL` (railway.app / railway.internal) — local Docker DB only (`AGENTS.md` safety rule).
3. **Re-run tests + build on the rebased tree**, not the original branch tip.

The merge itself is always **squash** — `main` stays linear: one squash commit per Story, carrying `CAR-<id>`.

### 11. Acceptance

Pre-production, small team — no separate QA role. The gate is:

| User-facing (acceptance pass required)                          | Internal-only (self-review is enough)            |
| --------------------------------------------------------------- | ------------------------------------------------ |
| Visible in `apps/web` (landing, calculator, catalog, dashboard) | NestJS refactor with no behaviour change         |
| Changes a calculated price / breakdown the client sees          | Scraper internals with no catalog-visible change |
| Affects auth, roles, or user data semantics                     | Telemetry, logging, test infra, docs             |
| Sends or changes an email / Telegram notification               | Internal-only admin plumbing                     |
| Migration that changes data shape seen by API/UI                | Pure index/refactor migration                    |

Acceptance pass = deploy to the preview/dev environment (Vercel preview for web, Railway for api), walk 2–3 verification bullets pulled from the plan, and post the result as a comment on the Jira Story. When in doubt, do the pass — a no-op check costs less than a missed regression.

### 12. Story close

Transition the Story to Done — via smart commit (`CAR-<id> ... #done`) or manually — once the squash commit lands on `main` and the acceptance pass (if required) is recorded. Verify the transition actually stuck before moving on.

### 13. Epic close

Use the `closing-an-epic` skill. Epic transitions to Done when:

- All child Stories are Done
- Code is deployed (Vercel production / Railway, verified by smoke test)
- Acceptance recorded (step 11)
- `docs/ROADMAP.md` status updated (emoji + %, move to completed table at 100%)
- `AGENTS.md` still accurate (architecture, business rules, commands, env vars)

---

## Bug Flow

Bugs are the documented exception to brainstorming + plan.

| Severity                          | Flow                                                                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Trivial / clear repro             | Create a Jira Bug directly. Branch as you prefer. Commit `CAR-<id> fix(...): ...`. PR. Done. No plan.                               |
| Complex / unclear / architectural | Promote to an Epic, write a mini-plan (can skip full brainstorming if scope is contained), get it reviewed, then Stories as normal. |

Most bugs are trivial. If you can describe the fix in two sentences, no plan needed. For non-trivial bugs, run the superpowers `systematic-debugging` skill before proposing fixes — reproduce → isolate → root cause, no guessing.

---

## Mid-sprint discoveries

The plan was wrong / incomplete / missed something:

| Type                                                          | Path                                                                                        |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Small additive (no design implication)                        | Append to the plan as a new phase, land a commit against the same `CAR-<id>`. No new Story. |
| Design-affecting (changes architecture, scope, or a contract) | **Stop.** Markdown PR amending the plan, reviewed, then resume against the same Story.      |
| Surfaces a genuinely separate feature                         | Don't bolt it on. Roadmap entry → Epic → its own plan, next sprint.                         |

---

## Definition of Done

| Level             | Criteria                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Brainstorming** | Design markdown in `docs/plans/`, key decisions + alternatives documented                                                                  |
| **Plan**          | `writing-plans` checklist passed, propagation points listed, review run, markdown PR merged                                                |
| **Story**         | Squash commit `CAR-<id> ...` on `main`, CI green, `pnpm test` green locally, acceptance recorded (user-facing), Story transitioned to Done |
| **Epic**          | All Stories Done, deployed, acceptance recorded, `docs/ROADMAP.md` updated                                                                 |
| **Roadmap item**  | Status `:white_check_mark: 100%`, Jira Epic = Done                                                                                         |

---

## Sprint Cadence (2 weeks, Jira sprints)

| Moment              | Activity                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| **Day 1**           | Sprint planning in Jira — pull Epics from backlog. Only Epics with an approved plan are eligible. |
| Daily               | Async update (Jira comments or board-only); skip if solo on an Epic                               |
| **Week 2, Thu**     | Code-freeze for sprint Epics. New work starts on next sprint's branches.                          |
| **Week 2, Thu–Fri** | Acceptance passes, `ROADMAP.md` updates, plan amendments for spillover                            |
| **Week 2, Fri**     | Retro. Move finished Epics; recompute roadmap rollup                                              |

**Epics without an approved plan do not enter the sprint.** Plans are written _before_ the sprint that builds them. (Current sprints — see `AGENTS.md`: Sprint 1 Foundation, Sprint 2 Auth + Landing + Calculator Engine.)

---

## Skills to use at each stage

Two tiers: **project skills** (`.agents/skills/`, committed to this repo — VitAuto-specific) and **superpowers skills** (user level, `~/.agents/skills/` — see `docs/superpowers-usage.md`).

| Stage                                           | Skill                                                                              | Required?                                |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------- |
| Autonomous work from a ticket link/key          | `working-a-jira-ticket` (project) — intake, In Progress → execute → In Review      | Yes for ticket-driven work               |
| Roadmap entry + Jira Epic                       | `roadmap-jira-linking` (project)                                                   | Yes                                      |
| Jira issue ops (comments, transitions, queries) | `jira` (user skill / Atlassian MCP)                                                | Yes                                      |
| Brainstorming                                   | `brainstorming-vitauto` (project) — wraps superpowers `brainstorming`              | Yes (skip only for bugs)                 |
| Writing plan                                    | `writing-vitauto-plans` (project) — wraps superpowers `writing-plans`              | Yes                                      |
| Plan review                                     | `requesting-code-review` (superpowers)                                             | **Yes — mandatory before plan PR merge** |
| High-stakes tradeoffs (design or plan stage)    | `llm-council` (user) — 5-advisor debate + verdict; see `docs/superpowers-usage.md` | Optional                                 |
| Executing plan                                  | `subagent-driven-development` (recommended) or `executing-plans` (superpowers)     | Pick one                                 |
| Implementation                                  | `test-driven-development` (superpowers)                                            | Recommended for new code                 |
| Non-trivial bug                                 | `systematic-debugging` (superpowers)                                               | Yes for unclear bugs                     |
| Branch isolation (optional)                     | `using-git-worktrees` (superpowers)                                                | Choice                                   |
| Pre-PR check                                    | `verification-before-completion` (superpowers)                                     | Yes                                      |
| Pre-merge + acceptance + Story close            | `merging-prs` (project)                                                            | **Yes — mandatory before squash-merge**  |
| Epic close-out                                  | `closing-an-epic` (project)                                                        | Yes                                      |
| Branch close-out                                | `finishing-a-development-branch` (superpowers)                                     | Recommended                              |

---

## Anti-patterns (and what to do instead)

| Anti-pattern                                                        | Why it hurts                                                                                           | Do this instead                                                                                  |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Creating the Story before the plan is approved                      | Plan changes in review → Story scope wrong → re-do work                                                | Wait for plan PR merge, then create the Story                                                    |
| Agent/dev creating a Jira Epic directly                             | Epics are the PO's call — board strategy belongs to product, not delivery                              | Prepare the Epic payload, hand it to the PO, mark roadmap `requested (pending PO)` until created |
| 3+ Stories under one Epic                                           | Re-introduces the breakdown layer the plan owns — board noise mirroring plan phases                    | One Story per Epic; max 2 for basket Epics                                                       |
| Jira sub-tasks as work breakdown                                    | Same clutter, one level down                                                                           | The plan's `## Phase N` sections are the breakdown                                               |
| Multiple `CAR-<id>`s in one squash commit                           | Traceability ambiguous — which issue does the merge close?                                             | One `CAR-<id>` per commit                                                                        |
| Skipping the plan review                                            | Spec-level bugs reach implementation 10× more expensively                                              | Always review the plan before the approval PR                                                    |
| Handwavy plan, dev improvises breakdown                             | With 1 Story on the board, the plan _is_ the work order — vague plan = chaos                           | Plan must have phases with exact file paths and verification steps                               |
| Plan with no `## Propagation points`                                | Coupled surfaces drift silently — shared-types out of sync, missing i18n keys break CI, AGENTS.md lies | Reviewer bounces the plan at step 5                                                              |
| Merging without rebasing on `origin/main`                           | Stale base can silently revert commits that landed during review                                       | Always rebase before squash; re-run tests on the rebased tree                                    |
| Rebasing over Prisma schema changes without regenerating migrations | Migration history forks; next dev's `db:migrate` produces phantom diffs or fails                       | Regenerate migrations on the rebased tree                                                        |
| `prisma migrate reset` / `db push --force-reset` against Railway    | Destroys the remote database                                                                           | `AGENTS.md` hard rule: destructive prisma commands are local-Docker-only                         |
| Hardcoding UI text in JSX                                           | Breaks i18n; CI `check:i18n` fails on key drift                                                        | All strings via next-intl, keys in BOTH `uk.json` and `en.json`                                  |
| Hardcoding calculator rates                                         | Changing rates retroactively breaks past calculations                                                  | Rates in `CalculationSettings`; every `Calculation` keeps a `settingsSnapshot`                   |
| "I'll update ROADMAP.md when it ships" (then forget)                | Roadmap drifts from reality                                                                            | ROADMAP.md update is part of Epic close                                                          |
| Bug raised as Epic with full plan                                   | Slows down trivial fixes                                                                               | Use the Bug Flow                                                                                 |
| Claiming "done" without running verification                        | Unverified claims ship bugs                                                                            | `verification-before-completion`: evidence before assertions                                     |

---

## Why this works for AI-paced dev

The discipline budget shifts. With AI:

- Coding is hours, not days
- Plans are days, not weeks
- Reviews are the bottleneck — review speed doesn't scale with AI

So we frontload review on the _plan_ (one rejection saves a day of code), not on every PR. And we keep the board flat: one Story per Epic, full stop. The plan's phases are the breakdown; the board is the receipt that the Epic shipped.

---

## Canonical sources

| Thing                      | Source                                                    |
| -------------------------- | --------------------------------------------------------- |
| Project conventions        | [`AGENTS.md`](../AGENTS.md)                               |
| Active roadmap             | `docs/ROADMAP.md`                                         |
| Active plans               | `docs/plans/*.md`                                         |
| Jira board                 | `CAR` project at `vladvit19.atlassian.net`                |
| Project skills (this repo) | [`.agents/skills/`](../.agents/skills/)                   |
| Superpowers skills guide   | [`docs/superpowers-usage.md`](superpowers-usage.md)       |
| CI gate                    | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) |
