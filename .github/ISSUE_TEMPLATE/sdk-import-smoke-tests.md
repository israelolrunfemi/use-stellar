---
name: "Import smoke tests"
about: "Add package import tests for ESM, CJS, and TypeScript consumers"
title: "Add package import smoke tests"
labels: "testing, tooling, sdk, intermediate"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b test/package-import-smoke-tests`
- Commit guideline: use `test(package): add import smoke tests`

### Context

The package publishes `main`, `module`, `types`, and `exports` fields. A build can pass while consumers still hit broken imports, missing types, or CJS/ESM mismatches after publishing.

### What needs solving

Catch package packaging problems before release.

### What needs doing

- Add smoke tests that build the core package and import it from a temporary consumer fixture.
- Verify ESM import works.
- Verify CommonJS require works if supported by the published export map.
- Verify TypeScript can resolve exported types.
- Ensure the test runs against `packages/core/dist`, not source-only paths.
- Add a package script such as `test:package` if appropriate.
- Document how maintainers run the smoke test before publishing.

### Acceptance criteria

- [ ] Smoke tests fail if `dist` exports are missing or broken.
- [ ] TypeScript consumer type resolution is checked.
- [ ] ESM import path is verified.
- [ ] CJS behavior is either verified or explicitly documented as unsupported.
- [ ] The test is wired into CI or release checks.
