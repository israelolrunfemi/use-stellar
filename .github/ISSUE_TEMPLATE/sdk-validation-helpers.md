---
name: "Validation helpers"
about: "Add robust validation for addresses, assets, amounts, memos, and contract IDs"
title: "Add SDK validation helpers"
labels: "typescript, sdk, good first issue"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b feat/validation-helpers`
- Commit guideline: use `feat(utils): add validation helpers`

### Context

Payment and lookup hooks are easier to use when invalid inputs are caught before network calls. The SDK has basic address helpers, but it needs a complete validation layer for common Stellar inputs.

### What needs solving

Prevent avoidable failed transactions and confusing Horizon errors by validating inputs early.

### What needs doing

- Add helpers for Stellar public keys, contract IDs, asset codes, issuer addresses, positive amount strings, and memo text length.
- Use Stellar SDK primitives where possible instead of regex-only validation.
- Return validation results with useful messages, not just `true` or `false`, where appropriate.
- Update `useSendPayment`, `useAsset`, and demo form pages to use the helpers.
- Export the helpers from the package entrypoint.
- Add tests for valid, invalid, empty, and boundary inputs.

### Acceptance criteria

- [ ] Invalid payment destination is caught before building a transaction.
- [ ] Invalid amount strings are rejected before submission.
- [ ] Asset code and issuer validation covers common mistakes.
- [ ] Validation helpers are exported and documented.
- [ ] Tests cover boundary cases.
