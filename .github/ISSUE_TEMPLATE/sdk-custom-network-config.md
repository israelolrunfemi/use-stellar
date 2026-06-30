---
name: "Custom network config"
about: "Allow apps to provide custom Horizon and Soroban RPC endpoints"
title: "Add custom network configuration support"
labels: "typescript, sdk, intermediate"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b feat/custom-network-config`
- Commit guideline: use `feat(provider): add custom network config`

### Context

`StellarProvider` currently accepts only `"testnet"` or `"mainnet"` and resolves URLs from the built-in `NETWORK_CONFIGS` map. Real apps often need custom Horizon or Soroban RPC endpoints for private infrastructure, rate-limit avoidance, testing, and future network variants.

### What needs solving

Make the SDK usable in production apps that cannot rely only on the default SDF endpoints.

### What needs doing

- Update `StellarProviderProps` to accept an optional `networkConfig` override.
- Preserve the current simple API: `<StellarProvider network="testnet">` must keep working.
- Allow callers to pass `{ network, horizonUrl, sorobanUrl }` explicitly.
- Validate that required URLs are present and fail with a clear error if not.
- Update `useNetwork()` to expose the effective config.
- Add examples to the README showing default and custom endpoint usage.
- Add tests for default config, custom config, and invalid config.

### Acceptance criteria

- [ ] Existing provider usage continues to work unchanged.
- [ ] Apps can pass custom Horizon and Soroban URLs.
- [ ] `useNetwork()` returns the effective custom config.
- [ ] Invalid custom config produces a clear developer-facing error.
- [ ] Tests cover default and custom network config paths.
