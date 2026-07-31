---
name: working-a-jira-ticket
description: Use when the user gives a Jira ticket link or key (e.g. https://vladvit19.atlassian.net/browse/CAR-123 or CAR-123) and asks to work on it - fetches full ticket + Epic context, transitions to In Progress on start, works autonomously, transitions to In Review with a summary comment when done
whenToUse: When the user pastes a Jira ticket URL or issue key and asks to implement/fix/work on it
---

# Working a Jira Ticket Autonomously

Input: a Jira ticket link (`https://vladvit19.atlassian.net/browse/CAR-123`) or a bare key (`CAR-123`). Extract the key from the URL (`/browse/<KEY>`).

All Jira operations go through the `jira` skill — run its backend detection first (`which jira` → CLI, else `mcp__atlassian__*` tools → MCP). If neither backend works (e.g. MCP not authenticated), **stop and surface the auth problem to the user** — do not work the ticket blind.

## Phase 1 — Intake (before writing any code)

1. **Fetch the ticket.** `jira issue view CAR-<id>` (CLI) or `mcp__atlassian__getJiraIssue` (MCP). Capture: summary, description, acceptance criteria, status, assignee, parent Epic, linked issues, recent comments.
2. **Fetch the parent Epic** (same tools) when the ticket is thin — the Epic carries the roadmap ID, scope, and plan reference. If the Epic or ticket references a plan (`docs/plans/...-plan.md`), **read the plan file** — it is the work order, its phases are the breakdown.
3. **Sanity-check the state** before touching anything:
   - Already `In Progress`/`In Review` and assigned to someone else → stop, report to the user, don't hijack.
   - `Done` → ask the user whether to reopen or whether they meant a follow-up ticket.
   - The ticket contradicts the plan or `AGENTS.md` rules → flag it before starting; project rules win.
4. **Start the clock:** assign to self if unassigned, then transition to **In Progress**.
   - MCP: `getTransitionsForJiraIssue` → `transitionJiraIssue` (never assume transition names — use what the board offers).
   - CLI: `jira issue move CAR-<id> "In Progress"`.
   - Post a short start comment: `Started: <one-line approach>`.

## Phase 2 — Execution (autonomous)

- Follow the ticket + plan. Use the superpowers skills per `docs/way-of-working.md`: `test-driven-development` for new code, `systematic-debugging` for unclear bugs, `subagent-driven-development` for multi-phase plans.
- Every commit: `CAR-<id> <type>(<scope>): <description>` (one ticket per commit).
- Respect `AGENTS.md` invariants: rates in `CalculationSettings` only, i18n keys in BOTH `uk.json`/`en.json`, DTOs in `packages/shared-types`, no destructive prisma against Railway.
- **If blocked** (missing info, contradicting requirements, failing external dependency): post a Jira comment describing the blocker, leave status at In Progress, and report to the user. Do not guess your way past a blocker and do not transition a blocked ticket to review.

## Phase 3 — Finish (mandatory, in order)

1. Run superpowers `verification-before-completion` — `pnpm test`, `pnpm type-check`, `pnpm lint`, `pnpm check:i18n`, `pnpm build` as applicable. Evidence before assertions.
2. Push the branch and open the PR (`<type>(<scope>): <subject>`, `CAR-<id>` in commit messages, not the PR title).
3. Transition the ticket to **In Review** (get available transitions first; if the board has no "In Review" state, use the closest review state and say which one you used).
4. Post a completion comment on the ticket:
   ```
   Done: <1-2 sentence summary of what changed>
   PR: <url>
   Verified: <commands run + results>
   Plan deviations: <none | what changed and why>
   ```
5. Report back to the user: ticket key, what was done, PR link, new status.

## Never

- Never work a ticket without reading it (and its Epic when thin) first.
- Never transition without fetching available transitions — workflow gates vary.
- Never mark In Review while checks are red or the implementation is partial.
- Never create or close Epics — Epics are the Product Owner's domain (see `roadmap-jira-linking`); In Progress/In Review on Stories and Bugs is your domain.
- Never merge the PR here — merging goes through the `merging-prs` skill when the user asks.

$ARGUMENTS
