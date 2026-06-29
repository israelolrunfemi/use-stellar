---
name: Add logging for network errors in useNetwork
about: Add debug logs for network detection failures in dev
title: Add logging for network errors in useNetwork
labels: logging, dev
---

Points: 3
Estimated time: 1 day

### What needs doing
- Add dev-only console/debug logs in `packages/core/src/hooks/useNetwork.ts` when detection fails.
- Ensure logs are gated behind `process.env.NODE_ENV !== 'production'`.

### Acceptance criteria
- [ ] Logs present in dev builds; no change to production bundles.

### Branch / Commit
- Suggested branch: `chore/network-logs`
- Commit example: `chore(useNetwork): add dev logs for network failures`

> Before pushing, run `git pull --rebase origin main` and resolve conflicts locally.
