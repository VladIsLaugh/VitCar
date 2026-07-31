---
name: closing-an-epic
description: Use when the last Story of a Jira Epic has merged - verifies deploy, records acceptance, updates docs/ROADMAP.md, and transitions the Epic to Done (way-of-working stage 13)
whenToUse: When all stories under a Jira Epic are Done and the feature is ready to be marked complete
---

# Closing an Epic

Stage 13 of `docs/way-of-working.md`. An Epic is Done only when ALL of these hold:

## Checklist

1. **All child Stories Done.** Query the Epic's children via the `jira` skill / Atlassian MCP. Anything still open → stop, the Epic isn't ready.

2. **Deployed and smoke-tested.** The squash commit is on `main` and live: Vercel production for `apps/web`, Railway for `apps/api`. Run a smoke check of the feature's main path (not just "the deploy succeeded").

3. **Acceptance recorded.**
   - User-facing Epic: acceptance-pass result posted as a Jira comment (done in `merging-prs` step 5 — verify it's there).
   - Internal-only Epic: a short self-acceptance comment on the Epic is enough.

4. **ROADMAP.md updated.** Set the section status (`:white_check_mark: 100%` when fully done, or the honest emoji + % if partially shipped) and move the entry to the completed table if 100%. Commit: `CAR-<epic-id> docs(roadmap): close <title>`.

5. **AGENTS.md still true?** If the feature changed architecture decisions, business rules, commands, or env vars listed in `AGENTS.md`, update it in the same commit.

6. **Transition the Epic to Done** via the `jira` skill, then re-query to confirm it stuck.

## Anti-patterns

- Closing with open Stories "because the code is merged" — the board is the receipt; make it match reality.
- Skipping the ROADMAP.md update ("I'll do it later") — roadmap drift makes rollup percentages lies.
- Marking Done without a deploy smoke test — "merged" ≠ "works in production".

$ARGUMENTS
