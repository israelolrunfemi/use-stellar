---
name: "useTransactions history"
about: "Add a hook for fetching recent account transactions"
title: "Add useTransactions hook for account history"
labels: "typescript, hook, intermediate"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b feat/use-transactions-history`
- Commit guideline: use `feat(hooks): add useTransactions`

### Context

After connecting a wallet, developers often need a recent transaction history list. Today they must reach for Horizon directly, which reduces the value of using the SDK.

### What needs solving

Make account dashboards and activity feeds possible with one hook.

### What needs doing

- Create `packages/core/src/hooks/useTransactions.ts`.
- Fetch recent transactions with `server.transactions().forAccount(address)`.
- Support options for `address`, `limit`, `cursor`, and `order`.
- Default to the connected wallet address when no address is passed.
- Return `{ transactions, loading, error, refetch, next }` or a similarly ergonomic shape.
- Export the hook and types from `packages/core/src/index.ts`.
- Add a demo page at `/demo/transactions`.
- Add tests with mocked Horizon responses.

### Acceptance criteria

- [ ] Hook returns recent transactions for a funded testnet account.
- [ ] Hook supports custom address and connected-wallet defaults.
- [ ] Pagination or next-page behavior is documented and tested.
- [ ] Demo page shows hash, ledger, timestamp, fee, and status.
- [ ] Hook is exported from the package entrypoint.
