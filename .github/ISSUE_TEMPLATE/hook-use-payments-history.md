---
name: "usePayments history"
about: "Add a hook for payment operation history"
title: "Add usePayments hook for account payment history"
labels: "typescript, hook, intermediate"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b feat/use-payments-history`
- Commit guideline: use `feat(hooks): add usePayments`

### Context

Transactions can contain many operation types. Most apps need a simpler payment history that shows incoming and outgoing payments, asset, amount, counterparty, and timestamp.

### What needs solving

Make wallets, payment apps, and portfolio dashboards easier to build with `use-stellar`.

### What needs doing

- Create `packages/core/src/hooks/usePayments.ts`.
- Fetch payment operations for an account using Horizon.
- Normalize native and issued asset payments into a typed result.
- Identify direction as `"incoming"` or `"outgoing"` relative to the account.
- Support `limit`, `cursor`, `order`, and custom `address`.
- Export the hook and result types.
- Add a demo page or add a payments tab to an existing account demo.
- Add tests for native payment, issued asset payment, and pagination.

### Acceptance criteria

- [ ] Hook returns normalized payment history.
- [ ] Incoming and outgoing payments are identified correctly.
- [ ] Native XLM and issued assets are both supported.
- [ ] Pagination behavior works or is clearly exposed.
- [ ] Tests cover success, empty, and error states.
