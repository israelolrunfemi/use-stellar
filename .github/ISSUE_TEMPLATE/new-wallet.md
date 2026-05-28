---
name: Add wallet support
about: Support a new Stellar wallet in useWallet
labels: wallet, typescript, good first issue
---

## Add [WALLET NAME] support to `useWallet`

### What to do
1. Add `"[wallet]"` to the `WalletType` union in `packages/core/src/types/index.ts`
2. Add a `connect[Wallet]` function in `packages/core/src/hooks/useWallet.ts`
3. Wire it into the `connect` switch statement
4. Test on Stellar testnet

### Wallet docs
<!-- Link to the wallet's API or extension docs here -->

### Notes
TypeScript only. Freighter is already implemented — use it as a reference.
