---
name: Small accessibility fix on demo buttons
about: Ensure demo buttons have accessible labels and focus states
title: Small accessibility fix on demo buttons
labels: a11y, demo
---

Points: 5
Estimated time: 1 day

### What needs doing
- Review demo components under `packages/demo/components` and `packages/demo/app/demo/*` for buttons missing `aria-label` or visible focus styles.
- Add labels and CSS focus styles as needed.

### Acceptance criteria
- [ ] Buttons have accessible labels and clear focus styles.

### Branch / Commit
- Suggested branch: `fix/demo-button-a11y`
- Commit example: `fix(demo): improve button accessibility`

> Before pushing, run `git pull --rebase origin main` and resolve conflicts locally.
