---
name: "Getting started quickstart"
about: "Write a complete first-10-minutes SDK guide"
title: "Write a getting started quickstart"
labels: "documentation, sdk, good first issue"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b docs/getting-started-quickstart`
- Commit guideline: use `docs(readme): add getting started quickstart`

### Context

Developers should be able to install `use-stellar`, wrap their app, connect a wallet, read a balance, and send a testnet payment without hunting through source files.

### What needs solving

Improve SDK adoption by making the first successful integration fast and reliable.

### What needs doing

- Add a clear quickstart to the README or docs entrypoint.
- Include install commands for pnpm, npm, and yarn if the repo style allows it.
- Show `StellarProvider` setup.
- Show a minimal wallet connect button.
- Show reading XLM balance.
- Show sending a small testnet payment with safety notes.
- Include Freighter setup and testnet network guidance.
- Add a troubleshooting section for common errors.

### Acceptance criteria

- [ ] A new developer can follow the guide without reading source code.
- [ ] Examples match the actual exported API.
- [ ] Testnet and mainnet safety notes are clear.
- [ ] Troubleshooting covers missing wallet, wrong network, unfunded account, and failed transaction.
