---
name: "Release readiness check"
about: "Add a release checklist command for maintainers"
title: "Add release readiness checks"
labels: "tooling, release, intermediate"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b tooling/release-readiness-check`
- Commit guideline: use `chore(release): add readiness checks`

### Context

Before publishing `use-stellar`, maintainers need confidence that formatting, linting, type checking, build output, tests, package exports, and docs are all in a releasable state.

### What needs solving

Reduce broken releases by giving maintainers one command that runs the right checks in the right order.

### What needs doing

- Add a root script such as `release:check`.
- Run formatting check, lint, typecheck, SDK build, SDK tests, and package smoke tests if available.
- Ensure the script targets `packages/core` for publishable package checks.
- Add a short section to `CONTRIBUTING.md` or release docs explaining when to run it.
- Keep the script cross-platform for Windows and CI.

### Acceptance criteria

- [ ] `pnpm release:check` runs all release readiness checks.
- [ ] The script works on Windows PowerShell and GitHub Actions.
- [ ] Failures stop the command with a non-zero exit code.
- [ ] Docs explain the publish package is `packages/core`.
- [ ] No demo-only checks block SDK release unless explicitly intended.
