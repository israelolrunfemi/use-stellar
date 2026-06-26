---
name: "Request cancellation"
about: "Prevent stale state updates and race conditions in async hooks"
title: "Add request cancellation and stale response guards"
labels: "typescript, sdk, intermediate"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b fix/hook-request-cancellation`
- Commit guideline: use `fix(hooks): guard stale async responses`

### Context

Hooks that fetch from Horizon can update state after a component unmounts or after inputs change quickly. That can cause stale balances, flickering errors, and React warnings in real apps.

### What needs solving

Make async hooks reliable under fast input changes, navigation, and repeated refetches.

### What needs doing

- Audit hooks that call Horizon or RPC.
- Add cancellation or stale-response guards using an approach that works with the current APIs.
- Ensure only the latest request updates hook state.
- Avoid setting state after unmount.
- Keep `refetch` behavior predictable.
- Add tests for rapid address changes and unmount-before-resolution.

### Acceptance criteria

- [ ] Hooks do not set state after unmount.
- [ ] Older requests cannot overwrite newer results.
- [ ] Loading state remains accurate during overlapping requests.
- [ ] Tests cover stale response behavior.
- [ ] Public hook APIs remain unchanged unless clearly justified.
