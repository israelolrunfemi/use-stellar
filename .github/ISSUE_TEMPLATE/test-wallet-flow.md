---
name: Add a small integration test for useWallet flow
about: Add an integration test simulating connect/disconnect flow
title: Add a small integration test for useWallet flow
labels: test, integration
---

Points: 20
Estimated time: 1 day

### What needs doing
- Add an integration test that mocks a wallet provider and simulates connect and disconnect flows for `useWallet`.
- Follow existing test patterns in `packages/core`.

### Acceptance criteria
- [ ] Integration test added and passes locally.

### Branch / Commit
- Suggested branch: `test/wallet-flow`
- Commit example: `test(useWallet): add connect/disconnect integration test`

> Before pushing, run `git pull --rebase origin main` and resolve conflicts locally.
