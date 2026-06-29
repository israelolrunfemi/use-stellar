---
name: Add input validation to demo send page
about: Prevent submitting empty destination or amount in demo send page
title: Add input validation to demo send page
labels: demo, validation
---

Points: 10
Estimated time: 1 day

### What needs doing
- Add client-side validation to `packages/demo/app/demo/send/page.tsx` to block empty destination or invalid amounts.
- Display inline validation errors.

### Acceptance criteria
- [ ] Validation present and prevents invalid submits.
- [ ] Demo page UI shows errors.

### Branch / Commit
- Suggested branch: `feature/demo-send-validation`
- Commit example: `feat(demo): add validation to send page`

> Before pushing, run `git pull --rebase origin main` and resolve conflicts locally.
