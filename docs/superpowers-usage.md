# Superpowers Skills — Usage Guide

Installed globally (user level) from [obra/superpowers](https://github.com/obra/superpowers) via `npx skills add obra/superpowers -g -y`.
Skills live in `~/.agents/skills/` and are available to Kimi Code in **every** project, not just this repo.

## What it is

Superpowers is a curated library of workflow skills (plain markdown) by Jesse Vincent. Each skill is a proven process the agent loads on demand — TDD, systematic debugging, planning, code review, etc. They are not code generators; they are **discipline checklists** that change _how_ the agent works.

## Installed skills (14)

| Skill                            | Trigger it when…                                                               |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `using-superpowers`              | Session start — meta-skill that forces skill lookup before any action          |
| `brainstorming`                  | Any creative work: new feature, component, behavior change. Design before code |
| `writing-plans`                  | You have a spec/requirements for a multi-step task, before touching code       |
| `executing-plans`                | Executing a written plan in a separate session with review checkpoints         |
| `subagent-driven-development`    | Executing a plan with independent tasks in the current session                 |
| `dispatching-parallel-agents`    | 2+ independent tasks with no shared state                                      |
| `test-driven-development`        | Implementing any feature or bugfix — test first, watch it fail                 |
| `systematic-debugging`           | Any bug, test failure, or unexpected behavior — before proposing fixes         |
| `verification-before-completion` | Before claiming "done / fixed / passing" — evidence before assertions          |
| `requesting-code-review`         | Completing tasks or before merging                                             |
| `receiving-code-review`          | Processing review feedback — verify, don't blindly implement                   |
| `using-git-worktrees`            | Starting feature work that needs an isolated workspace                         |
| `finishing-a-development-branch` | Implementation complete, tests pass — decide how to integrate                  |
| `writing-skills`                 | Creating or editing skills                                                     |

## How to use

Two ways:

**1. Explicit (recommended while learning).** Name the skill in your prompt:

```
Use the brainstorming skill: I want to add a "compare cars" feature to the catalog.
```

```
A saved calculation shows the wrong excise for 2020 diesels.
Use systematic-debugging to find the root cause before fixing.
```

```
Implement CAR-88 (garage pagination) with test-driven-development.
```

**2. Automatic.** Once you describe a task that matches a skill's trigger, the agent should invoke it on its own. If it doesn't, name the skill explicitly.

## Example workflows for this project (VitAuto)

**New feature (full pipeline):**

```
Brainstorm, then plan, then TDD a "price-drop alert" feature:
users get a Telegram notification when a saved lot's estimate changes.
```

Expected flow: `brainstorming` → design approval → `writing-plans` → plan file → `test-driven-development` → `verification-before-completion` → `requesting-code-review`.

**Bug fix:**

```
The calculator shows excise 0 for hybrids. Debug it systematically, don't guess.
```

Expected flow: `systematic-debugging` (reproduce → isolate → root cause) → fix with `test-driven-development` → `verification-before-completion`.

**Parallel work:**

```
Use dispatching-parallel-agents to (1) audit i18n key parity gaps in messages/ and
(2) review the scraper module for error-handling gaps.
```

**Plan execution in a fresh session:**

```
Execute the plan in docs/plans/price-drop-alerts.md using executing-plans.
```

## LLM Council (`llm-council`)

Installed from [aiwithremy/claude-skills-llm-council](https://github.com/aiwithremy/claude-skills-llm-council) (Karpathy's LLM Council methodology). Spins up 5 advisor subagents in parallel (Contrarian, First Principles, Expansionist, Outsider, Executor), anonymizes their takes, runs a peer-review round, then a chairman synthesizes a verdict: where they agree, where they clash, blind spots caught, a recommendation, and one first step.

**When to use it** — genuine decisions with stakes and real tradeoffs:

- Architecture tradeoffs that 3+ modules depend on (feeds the plan's `## Decisions` section)
- Business/pricing calls (e.g. serviceFee level, subscription vs per-car pricing)
- "Should I X or Y", "which option", "I'm torn between", "pressure-test this plan"

**When NOT to use it** — factual lookups, creation tasks, simple yes/no, anything with one right answer. A bug fix goes to `systematic-debugging`, not the council.

**Trigger phrases:** "council this", "run the council on …", "pressure-test this", "stress-test this", "war room this".

**VitAuto examples:**

```
Council this: should the lot catalog show only sold historical lots,
or also upcoming auctions with estimated fees?
```

```
Pressure-test this plan before I open the approval PR: docs/plans/2026-08-01-price-drop-alerts-plan.md
```

```
Council: $500 flat serviceFee vs 3% of lot price — which survives a competitor undercutting us?
```

**Where it fits the flow (`docs/way-of-working.md`):** optional but valuable between stage 3 (brainstorming) and stage 5 (plan review) — council the design or the plan before the approval PR. The verdict is input to a human/agent decision, not an auto-approval.

**Caveats:**

- All 5 advisors run on the same underlying model here — diversity comes from the thinking lenses, not from genuinely different LLMs (Karpathy's original used different models). Still useful, but treat "the council agrees" as perspective coverage, not independent confirmation.
- It scans `CLAUDE.md`/`memory/` for context; in this repo the equivalent is `AGENTS.md` + `docs/` — point it there if the framing looks generic.
- Transcripts are optional; if saved, put them in `docs/plans/` next to the design they informed, not a random `active/` folder.

## Maintenance

```bash
npx skills check    # check for updates
npx skills update   # update all installed skills
```

## Caveats

- Skills are user-level (`~/.agents/skills/`), not committed to this repo — every contributor/agent machine must install them separately.
- Some skills reference Claude Code specifics (slash commands, git worktrees hooks). The workflow logic still applies; adapt command syntax to the tool at hand.
- Project rules in `AGENTS.md` (commit format, safety rules, i18n parity) always win over a skill's generic advice.
