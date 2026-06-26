# Contributing to use-stellar

Thank you for your interest in contributing. This project is designed to be easy to contribute to — if you know React and TypeScript, you can add a hook, improve an existing one, write tests, or fix a bug without any blockchain or Stellar expertise.

---

## What kind of contributions are welcome

- **New hooks** — the most impactful contribution. See the list of open hook issues.
- **New wallet support** — add Albedo, Rabet, xBull, or any other Stellar wallet to `useWallet`.
- **Tests** — unit and integration tests for any hook.
- **Bug fixes** — anything labelled `bug`.
- **Demo pages** — add or improve the live demo for a hook.
- **Documentation** — improve the README, add JSDoc to hooks, or fix typos.

---

## Setup

### Requirements

- Node.js 20+
- pnpm (We use pnpm workspaces)

No Rust, no Stellar CLI, no wallet required to run tests or work on most hooks.

### Clone and install

```bash
git clone [https://github.com/YOUR_HANDLE/use-stellar](https://github.com/YOUR_HANDLE/use-stellar)
cd use-stellar
pnpm install