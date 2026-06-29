---
name: Export missing type from types/index.ts
about: Export a missing type used in useAsset
title: Export missing type from types/index.ts
labels: typescript, types
---

Points: 5
Estimated time: 1 day

### What needs doing
- Add and export the missing type (for example `AssetInfo`) from `packages/core/src/types/index.ts`.
- Update imports across the codebase if needed.

### Acceptance criteria
- [ ] Type exported and TypeScript builds without errors.

### Branch / Commit
- Suggested branch: `fix/export-missing-type`
- Commit example: `fix(types): export AssetInfo type`

> Before pushing, run `git pull --rebase origin main` and resolve conflicts locally.
