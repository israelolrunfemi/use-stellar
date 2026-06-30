---
name: "useTrustline"
about: "Add a hook for checking and creating asset trustlines"
title: "Add useTrustline hook"
labels: "typescript, hook, wallet, advanced"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b feat/use-trustline`
- Commit guideline: use `feat(hooks): add useTrustline`

### Context

Sending or receiving issued assets requires trustlines. Developers currently have to manually inspect balances, build `changeTrust` transactions, sign them, and handle common errors.

### What needs solving

Make issued-asset flows usable by helping apps detect and create trustlines safely.

### What needs doing

- Create `packages/core/src/hooks/useTrustline.ts`.
- Expose trustline state for a code/issuer pair: exists, limit, balance, buying liabilities, selling liabilities.
- Add a `createTrustline` action that builds, signs, and submits a `changeTrust` transaction.
- Reuse wallet signing logic from `useSendPayment` or the wallet adapter if available.
- Validate asset code, issuer, and optional limit.
- Add a demo page at `/demo/trustline`.
- Add tests for existing trustline, missing trustline, invalid asset, and rejected signing.

### Acceptance criteria

- [ ] Hook can detect whether a connected account has a trustline.
- [ ] Hook can create a trustline on testnet with wallet signing.
- [ ] User rejection is handled without crashing.
- [ ] Demo page shows trustline status and action state.
- [ ] Hook and types are exported.
