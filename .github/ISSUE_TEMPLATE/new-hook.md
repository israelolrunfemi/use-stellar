---
name: New hook
about: Add a new React hook to use-stellar
labels: hook, typescript, good first issue
---

## New hook: `use[Name]`

### What it does
<!-- Describe what this hook should do in one sentence -->

### Proposed API
```typescript
const { ... } = use[Name]({ ... })
```

### Acceptance criteria
- [ ] Hook implemented in `packages/core/src/hooks/use[Name].ts`
- [ ] Hook exported from `packages/core/src/index.ts`
- [ ] Types added to `packages/core/src/types/index.ts` if needed
- [ ] Unit tests written in `packages/core/src/hooks/use[Name].test.ts`
- [ ] Demo page added at `packages/demo/app/demo/[name]/page.tsx`
- [ ] Hook listed on the demo home page

### Notes
TypeScript only — no Rust or blockchain expertise needed.
Read an existing hook like `useBalance.ts` to see the pattern.
