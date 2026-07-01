---
name: Add missing export re-export in package entry
about: Re-export a convenience symbol from package root
title: Add missing export re-export in package entry
labels: types, exports
---

Points: 5
Estimated time: 1 day

### What needs doing
- Re-export a convenience symbol such as `AssetInfo` from `packages/core/src/index.ts`.
- Update package entry exports so consumers can import from the root.

### Acceptance criteria
- [ ] Symbol is re-exported from the package root.
- [ ] Build passes without TypeScript errors.

### Branch / Commit
- Suggested branch: `chore/reexport-root`
- Commit example: `chore(exports): re-export AssetInfo from root`

> Before pushing, run `git pull --rebase origin main` and resolve conflicts locally.
