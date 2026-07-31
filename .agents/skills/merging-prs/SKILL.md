---
name: merging-prs
description: Use before squash-merging any PR in this repo - enforces rebase on main, Prisma migration re-check, retest on rebased tree, squash with CAR-id commit, and the post-merge acceptance + Jira handoff (way-of-working stages 10-12)
whenToUse: When the user asks to merge a PR, finish a story, or says a PR is approved and ready to land
---

# Merging PRs (VitAuto)

Mandatory before every squash-merge. Covers stages 10–12 of `docs/way-of-working.md`.

## Pre-merge (in order)

1. **Checks green.** `gh pr checks <pr>` — CI jobs: lint, check-i18n, type-check, build. Note: CI does NOT run jest — confirm `pnpm test` was run locally and passed.

2. **Rebase on `origin/main`.** GitHub's "no conflicts" is a textual check only — a stale base can silently revert commits that landed during review.

   ```bash
   git fetch origin && git rebase origin/main
   ```

3. **Prisma migration re-check.** If the branch touches `apps/api/prisma/schema.prisma` or `apps/api/prisma/migrations/` AND main moved meanwhile: regenerate the migration on the rebased tree (`pnpm db:migrate` against the local Docker DB) so history stays linear.
   - **NEVER** `prisma migrate reset`, `db push --force-reset`, `DROP TABLE`, or `TRUNCATE` when `DATABASE_URL` points at railway.app / railway.internal. Local Docker DB only.

4. **Retest the rebased tree** (not the old branch tip): `pnpm test && pnpm type-check && pnpm build`. If i18n files changed: `pnpm check:i18n`.

## Merge

Always **squash** — `main` stays linear, one squash commit per Jira Story:

```bash
gh pr merge <pr> --squash --subject "CAR-<id> <type>(<scope>): <description>"
```

- Exactly one `CAR-<id>` per commit. Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`.
- Do not use a merge commit or rebase-merge — WIP commits must not leak into `main`.

## Post-merge handoff

5. **Acceptance pass (user-facing changes).** User-facing = visible in `apps/web`, changes a client-visible price/breakdown, touches auth/roles/user data, sends/changes email or Telegram notifications, or a data-shape migration. For those: deploy/preview (Vercel preview for web, Railway for api), walk 2–3 verification bullets from the plan, and post the result as a comment on the Jira Story. Internal-only changes (refactors, telemetry, docs, test infra) skip this.

6. **Close the Story.** Transition the Jira Story to Done (smart commit `CAR-<id> ... #done` or manually via the `jira` skill) and verify the transition stuck.

7. **Epic still open?** If more Stories remain under the Epic, stop here. If this was the last Story, run the `closing-an-epic` skill (stage 13).

$ARGUMENTS
