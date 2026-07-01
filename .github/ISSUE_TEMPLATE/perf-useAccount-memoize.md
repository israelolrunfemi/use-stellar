---
name: Small performance tweak in useAccount (memoization)
about: Memoize expensive derived calculations in useAccount
title: Small performance tweak in useAccount (memoization)
labels: perf, hooks
---

Points: 8
Estimated time: 1 day

### What needs doing
- Add `useMemo` or equivalent memoization to expensive derived calculations in `packages/core/src/hooks/useAccount.ts`.
- Add a small test to validate behavior remains unchanged.

### Acceptance criteria
- [ ] Performance improved slightly; behavior unchanged.

### Branch / Commit
- Suggested branch: `perf/useAccount-memoize`
- Commit example: `perf(useAccount): memoize derived calculations`

> Before pushing, run `git pull --rebase origin main` and resolve conflicts locally.
