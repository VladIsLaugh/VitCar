---
name: roadmap-jira-linking
description: Use when starting a new feature/initiative - creates the docs/ROADMAP.md entry and the Jira Epic (CAR project) and links them bidirectionally, per docs/way-of-working.md stages 1-2
whenToUse: When the user asks to start, propose, or roadmap a new feature or initiative
---

# Roadmap ↔ Jira Linking

Every active roadmap item is bidirectionally linked to a Jira Epic. No exceptions. This is stages 1–2 of `docs/way-of-working.md`.

## Steps

1. **Roadmap entry.** Add a section to `docs/ROADMAP.md` (create the file with a `# VitAuto Roadmap` heading if it doesn't exist):

   ```markdown
   ### <PREFIX>-NN — <Title> :clipboard: 0%

   **Jira:** CAR-<id> (added in step 3)
   **Scope:** 1-2 sentences — what and why.
   **Plan:** _Plan needed_ (replaced after the plan PR merges)
   ```

   - ID prefix matches the domain: `CALC`, `LOTS`, `AUTH`, `ADMIN`, `SCRAPE`, `NOTIF`, etc.
   - Status emoji: `:rocket:` launch blocker, `:construction:` in progress, `:triangular_ruler:` designed, `:clipboard:` planned, `:bulb:` concept, `:white_check_mark:` done.

2. **Jira Epic — request it, don't create it.** Only the Product Owner creates Epics in project `CAR` at `vladvit19.atlassian.net`. Your job is to hand the PO a ready-to-paste Epic payload:
   - Title: short, action-style.
   - Description: roadmap ID, scope, plan reference (or "Plan needed:" placeholder until stage 4).
   - Roadmap link: `docs/ROADMAP.md` section anchor.

   Output the payload in your reply (or post it as a comment in the appropriate Jira/thread if the user asks). **Never create the Epic yourself** — no exceptions, even if the Jira tools would let you.

3. **Bidirectional link.** Once the PO confirms the Epic exists (or you see `CAR-<id>` on the board), add the `**Jira:** CAR-<id>` line to the roadmap section and commit. Until then the roadmap entry keeps a `**Jira:** requested (pending PO)` marker so the gap is visible.

## Rules

- The Epic is created at roadmap time, but **Stories are created only after the plan PR merges** (stage 7) — never before.
- If the idea turns out to be a bug, stop here and use the Bug Flow in `docs/way-of-working.md` instead.
- Next step after linking: run the superpowers `brainstorming` skill (stage 3).

$ARGUMENTS
