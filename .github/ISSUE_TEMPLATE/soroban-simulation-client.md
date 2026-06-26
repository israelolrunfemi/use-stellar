---
name: "Soroban simulation client"
about: "Replace placeholder Soroban behavior with real read-only simulation"
title: "Wire useSorobanContract to real Soroban simulation"
labels: "typescript, soroban, advanced"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b feat/soroban-simulation-client`
- Commit guideline: use `feat(soroban): add contract simulation`

### Context

`useSorobanContract` currently returns placeholder data instead of calling the Soroban RPC. This makes the hook useful as a demo shell but not usable for real apps.

### What needs solving

Make the Soroban hook actually call read-only contract functions so developers can build contract dashboards and debugging tools.

### What needs doing

- Replace placeholder return data in `useSorobanContract`.
- Use the Stellar SDK Soroban RPC client appropriate for the current dependency version.
- Accept method arguments in a documented shape.
- Convert supported JavaScript values to Soroban values, or document the exact expected argument type.
- Return decoded results when possible and raw results when decoding is not possible.
- Keep write calls out of scope unless already supported safely.
- Update the `/demo/soroban` page to show real results.
- Add tests with mocked RPC responses.

### Acceptance criteria

- [ ] A known read-only testnet contract method returns a real result.
- [ ] Invalid contract ID and method errors are clear.
- [ ] The hook no longer returns placeholder data.
- [ ] Demo page displays formatted result JSON.
- [ ] Tests cover success and RPC failure states.
