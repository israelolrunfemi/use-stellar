---
name: "Typed error factory"
about: "Centralize SDK error creation and Horizon error mapping"
title: "Add a centralized typed error factory"
labels: "typescript, sdk, intermediate"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b feat/typed-error-factory`
- Commit guideline: use `feat(errors): add typed error factory`

### Context

Hooks currently build error strings in multiple places. That makes behavior inconsistent and makes it hard for application developers to react to specific conditions like missing accounts, rejected wallet requests, bad trustlines, or network failures.

### What needs solving

Give every hook a consistent error shape that developers can handle programmatically.

### What needs doing

- Create a central error helper in `packages/core/src/errors` or an existing appropriate location.
- Define stable error codes for wallet, Horizon, validation, network, and unknown failures.
- Map Horizon result codes such as `op_underfunded`, `op_no_trust`, 404, and rate-limit/network failures.
- Update hooks to use the shared helper instead of ad hoc strings.
- Keep error messages human-readable for demo pages.
- Add tests for error mapping and fallback behavior.

### Acceptance criteria

- [ ] All hook errors are created through one shared helper.
- [ ] Common Horizon and wallet failures map to stable codes.
- [ ] Demo pages can display `error.message` without special casing.
- [ ] Tests cover known error mappings and unknown errors.
