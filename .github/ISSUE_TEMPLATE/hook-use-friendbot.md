---
name: "useFriendbot"
about: "Add a testnet funding helper for examples and onboarding"
title: "Add useFriendbot testnet funding hook"
labels: "typescript, hook, good first issue"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b feat/use-friendbot`
- Commit guideline: use `feat(hooks): add useFriendbot`

### Context

New Stellar developers often get stuck before they can test anything because their testnet account is unfunded. Friendbot funding is a key onboarding step, but it is not represented in the SDK.

### What needs solving

Make the demo and developer onboarding smoother by exposing a safe testnet-only funding helper.

### What needs doing

- Create `packages/core/src/hooks/useFriendbot.ts`.
- Only allow funding on `testnet`; return a clear error on `mainnet`.
- Accept an optional address and default to the connected wallet address.
- Call the official Friendbot endpoint.
- Return funding status, response hash if available, loading, error, and `fund` action.
- Add a demo action to the wallet or account page.
- Add tests mocking the network request.

### Acceptance criteria

- [ ] Funding works for a valid testnet G address.
- [ ] Mainnet use is blocked with a clear error.
- [ ] Missing address returns a helpful message.
- [ ] Demo exposes a fund-testnet-account action.
- [ ] Hook is exported and documented as testnet-only.
