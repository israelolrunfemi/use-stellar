---
name: "Wallet network sync"
about: "Detect wallet network changes and keep SDK state accurate"
title: "Keep wallet network state in sync"
labels: "typescript, wallet, sdk, intermediate"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b fix/wallet-network-sync`
- Commit guideline: use `fix(wallet): sync wallet network state`

### Context

Users can change networks inside wallet extensions after connecting. If the SDK keeps stale wallet network state, payments may be built for the wrong network or fail with confusing errors.

### What needs solving

Make connected wallet state reflect the real wallet network throughout the session.

### What needs doing

- Investigate the current Freighter API for network change detection or polling.
- Add a safe way to refresh wallet network details.
- Expose network mismatch state in `useWallet` or a helper return field.
- Prevent send/payment actions when wallet network does not match provider network.
- Update the wallet demo to show current provider network and wallet network.
- Add tests for matching and mismatched network state.

### Acceptance criteria

- [ ] Wallet network state can be refreshed after connection.
- [ ] Mismatched wallet/provider network is visible to developers.
- [ ] Payment hooks block unsafe submission on network mismatch.
- [ ] Demo page clearly shows network status.
- [ ] Tests cover mismatch handling.
