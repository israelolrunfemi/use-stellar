---
name: "SSR and Next.js safety"
about: "Make browser-wallet code safe in server-rendered apps"
title: "Make use-stellar safe for SSR and Next.js App Router"
labels: "typescript, nextjs, sdk, intermediate"
---

### Before starting

- Pull the latest changes: `git pull --rebase origin main`
- Create a branch: `git checkout -b fix/ssr-nextjs-safety`
- Commit guideline: use `fix(wallet): guard browser-only wallet APIs`

### Context

Many consumers will use `use-stellar` inside Next.js, Remix, or other SSR-capable React apps. Wallet APIs are browser-only, so code that touches wallet globals or extension APIs too early can break server rendering or hydration.

### What needs solving

Make the SDK safe to import and render in SSR environments while still enabling wallet connection in client components.

### What needs doing

- Audit all wallet-related hooks for browser-only assumptions.
- Ensure importing `use-stellar` on the server does not access `window`, extension globals, or browser-only APIs.
- Add a small helper such as `isBrowser()` if it matches the project style.
- Return clear wallet errors only after a user action such as `connect()`.
- Update the demo docs or README with a Next.js App Router example using `"use client"`.
- Add tests or smoke coverage proving hooks can be imported in a Node test environment.

### Acceptance criteria

- [ ] `import { StellarProvider, useWallet } from "use-stellar"` does not crash in a Node/SSR environment.
- [ ] Wallet connection still works in the browser.
- [ ] Server-side failures are replaced with clear client-only guidance.
- [ ] README includes Next.js App Router usage guidance.
