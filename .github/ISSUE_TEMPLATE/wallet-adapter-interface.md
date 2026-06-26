---
name: "Wallet adapter interface"
about: "Introduce a wallet adapter layer for Freighter, Albedo, and future wallets"
title: "Create a wallet adapter interface"
labels: "typescript, wallet, sdk, advanced"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b feat/wallet-adapter-interface`
- Commit guideline: use `feat(wallet): add adapter interface`

### Context

`useWallet` currently owns connection logic directly. As more wallets are added, the hook will become difficult to maintain unless wallet behavior is isolated behind a consistent adapter contract.

### What needs solving

Make wallet support scalable so adding a wallet does not require rewriting core hook logic.

### What needs doing

- Design a `WalletAdapter` interface with methods for availability, connect, disconnect if supported, network details, and transaction signing.
- Move Freighter logic into a `freighterAdapter`.
- Prepare adapter slots for Albedo and future wallets without shipping broken behavior.
- Update `WalletType` and wallet state to use adapter metadata where useful.
- Keep `useWallet().connect("freighter")` backward compatible.
- Add tests for adapter selection, unsupported wallets, and Freighter success/error paths.

### Acceptance criteria

- [ ] Freighter connection is implemented through an adapter.
- [ ] Unsupported wallets return a clear, typed error.
- [ ] `useWallet` public API remains backward compatible.
- [ ] The adapter interface supports signing transactions for `useSendPayment`.
- [ ] Tests cover adapter selection and error handling.
