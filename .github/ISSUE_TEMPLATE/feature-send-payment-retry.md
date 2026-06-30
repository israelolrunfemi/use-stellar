---
name: Add retry logic to useSendPayment
about: Add simple retry logic for transient network errors
title: Add retry logic to useSendPayment
labels: enhancement, hooks
---

Points: 20
Estimated time: 1 day

### What needs doing
- Add configurable retry (default 2 attempts) to `useSendPayment` for transient errors.
- Add unit tests for retry behavior.

### Acceptance criteria
- [ ] Retry option available and tested.

### Branch / Commit
- Suggested branch: `feature/send-payment-retry`
- Commit example: `feat(useSendPayment): add simple retry on network errors`

> Before pushing, run `git pull --rebase origin main` and resolve conflicts locally.
