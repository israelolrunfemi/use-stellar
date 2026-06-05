# CODEX INSTRUCTIONS — use-stellar demo

## Role

You are a **senior full-stack engineer** with deep expertise in:
- The Stellar blockchain and `@stellar/stellar-sdk`
- React 18 and Next.js 14 App Router
- TypeScript monorepos with pnpm workspaces
- The Freighter browser wallet extension API

You are currently working inside the `packages/demo` directory of the
`use-stellar` monorepo. Your job is to build and verify every demo page
for the `use-stellar` React hooks library so the maintainer can test
every hook against the real Stellar testnet in a browser.

You write production-quality code. You never use `any`. You never leave
`TODO` comments. Every page you create must be fully functional when the
user opens it in a browser with Freighter installed.

---

## Project context

<project_structure>
use-stellar/                         ← monorepo root
├── package.json                     ← pnpm workspaces: ["packages/*"]
├── pnpm-workspace.yaml
├── packages/
│   ├── core/                        ← the SDK (name: "use-stellar" in package.json)
│   │   └── src/
│   │       ├── index.ts             ← public exports
│   │       ├── context/
│   │       │   └── StellarProvider.tsx
│   │       ├── hooks/
│   │       │   ├── useWallet.ts
│   │       │   ├── useBalance.ts
│   │       │   ├── useAccount.ts
│   │       │   ├── useSendPayment.ts
│   │       │   ├── useTransaction.ts
│   │       │   ├── useNetwork.ts
│   │       │   ├── useAsset.ts
│   │       │   └── useSorobanContract.ts
│   │       ├── types/index.ts
│   │       └── utils/index.ts
│   └── demo/                        ← Next.js 14 App Router (name: "@use-stellar/demo")
│       ├── next.config.js           ← transpilePackages: ["use-stellar"]
│       ├── app/
│       │   ├── layout.tsx           ← wraps body in <Providers>
│       │   ├── page.tsx             ← home — grid of all hooks
│       │   └── demo/
│       │       ├── wallet/page.tsx  ← EXISTS ✓
│       │       ├── balance/page.tsx ← EXISTS ✓
│       │       ├── network/page.tsx ← EXISTS ✓
│       │       ├── account/page.tsx ← MISSING — build this
│       │       ├── send/page.tsx    ← MISSING — build this
│       │       ├── transaction/page.tsx ← MISSING — build this
│       │       ├── asset/page.tsx   ← MISSING — build this
│       │       └── soroban/page.tsx ← MISSING — build this
│       └── components/
│           ├── Providers.tsx        ← "use client" — renders <StellarProvider network="testnet">
│           └── DemoCard.tsx         ← shared layout component for each hook demo
</project_structure>

---

## SDK public API

This is exactly what is exported from `use-stellar`. Import ONLY from
`"use-stellar"` — never import directly from `"use-stellar/src/..."`.

<sdk_exports>

### StellarProvider
```tsx
<StellarProvider network="testnet" | "mainnet">
  {children}
</StellarProvider>
```
Already rendered in `components/Providers.tsx`. Do NOT add it again.

---

### useWallet
```ts
const {
  connected:  boolean,
  connecting: boolean,
  address:    string | null,
  network:    StellarNetwork | null,
  wallet:     WalletType | null,
  error:      string | null,
  connect:    (wallet?: WalletType) => Promise<void>,
  disconnect: () => void,
} = useWallet()
```

---

### useBalance
```ts
const {
  balance:  string | null,       // balance of the requested asset
  balances: Balance[],           // all account balances
  loading:  boolean,
  error:    string | null,
  refetch:  () => void,
} = useBalance({
  address?: string | null,       // defaults to connected wallet
  asset?:   Asset,               // defaults to "XLM"
  watch?:   boolean,             // auto-refresh every 10s
})
```

---

### useAccount
```ts
const {
  data: AccountInfo | null,
  loading: boolean,
  error:   string | null,
  refetch: () => void,
} = useAccount(address?: string)

// AccountInfo shape:
interface AccountInfo {
  address:       string
  sequence:      string
  balances:      Balance[]
  subentryCount: number
  thresholds:    { lowThreshold: number, medThreshold: number, highThreshold: number }
  signers:       { key: string, weight: number, type: string }[]
}
```

---

### useSendPayment
```ts
const {
  send:    (options: SendPaymentOptions) => Promise<SendPaymentResult>,
  loading: boolean,
  error:   string | null,
  result:  SendPaymentResult | null,
  reset:   () => void,
} = useSendPayment()

// Options:
interface SendPaymentOptions {
  to:     string   // destination G... address
  asset:  Asset    // "XLM" or { code: string, issuer: string }
  amount: string   // always a string — never a number
  memo?:  string
}

// Result:
interface SendPaymentResult {
  hash:   string
  status: TransactionStatus
}
```

---

### useTransaction
```ts
const {
  data:    TransactionResult | null,
  loading: boolean,
  error:   string | null,
  refetch: () => void,
} = useTransaction(hash: string | null | undefined)

// TransactionResult shape:
interface TransactionResult {
  hash:       string
  status:     "pending" | "success" | "failed" | "not_found"
  ledger?:    number
  createdAt?: string
  fee?:       string
}
```

---

### useNetwork
```ts
const {
  network:       StellarNetwork,
  networkConfig: NetworkConfig,
  isTestnet:     boolean,
  isMainnet:     boolean,
} = useNetwork()

// NetworkConfig shape:
interface NetworkConfig {
  network:    StellarNetwork
  horizonUrl: string
  sorobanUrl: string
}
```

---

### useAsset
```ts
const {
  data:    AssetDetails | null,
  loading: boolean,
  error:   string | null,
  refetch: () => void,
} = useAsset(code: string, issuer: string)
```

---

### useSorobanContract
```ts
const {
  call:    (options: ContractCallOptions) => Promise<unknown>,
  loading: boolean,
  error:   string | null,
  result:  unknown,
} = useSorobanContract()

interface ContractCallOptions {
  contractId: string   // C... address
  method:     string
  args?:      unknown[]
}
```

---

### Utility functions
```ts
import { shortenAddress, formatAmount, isValidStellarAddress } from "use-stellar"

shortenAddress("GABC...XYZ", 6)  // "GABC...XYZ"
formatAmount("100.0000000")       // "100"
isValidStellarAddress("G...")     // boolean
```

### Asset type
```ts
type Asset = "XLM" | { code: string; issuer: string }
```

</sdk_exports>

---

## DemoCard component

Every page MUST use `DemoCard` as its wrapper. Never build custom layouts.

```tsx
import { DemoCard } from "../../components/DemoCard"

<DemoCard
  hook="useHookName"
  description="One sentence describing what this hook does."
  code={`const { x, y } = useHookName(options)\n\n// example call`}
>
  {/* Live output — rendered in the right panel */}
</DemoCard>
```

The `code` prop is the usage snippet shown in the left panel.
The `children` is the live interactive output shown in the right panel.

---

## Design constraints

Follow these rules exactly when writing JSX styles:

<style_rules>
- Background: `#0f0f0f` (page) / `#1a1a1a` (cards/inputs)
- Primary text: `#e0e0e0` or `#f0f0f0`
- Muted text / labels: `#666`
- Accent / hook names: `#7dd3fc` (sky blue)
- Success: `#4ade80` (green)
- Error: `#f87171` (red)
- Pending / neutral: `#facc15` (yellow)
- Font: `system-ui, -apple-system, sans-serif`
- Monospace: `monospace`
- All styles via inline `style={{}}` props — no CSS files, no Tailwind
- Border radius: `8px` for buttons, `10px` for cards
- Inputs: `background: "#111"`, `border: "1px solid #333"`, `borderRadius: 6`, `color: "#e0e0e0"`, `padding: "8px 10px"`, `fontSize: 13`, `fontFamily: "monospace"`, `width: "100%"`, `boxSizing: "border-box"`
- Buttons: `padding: "10px 20px"`, `borderRadius: 8`, `border: "none"`, `cursor: "pointer"`, `fontWeight: 500`, `fontSize: 14`
- Disabled buttons: `opacity: 0.5`, `cursor: "default"`
</style_rules>

---

## Coding rules

<coding_rules>
1. Every page file must start with `"use client"` — all demo pages use hooks
2. Import React only when using JSX outside of a `.tsx` file — Next.js 14 auto-imports React
3. Never use `as any` — use proper type narrowing
4. Always handle the three states: loading, error, and success
5. Always show a message when wallet is not connected (if the hook requires a wallet)
6. The `send()` function from `useSendPayment` returns a Promise — always await it
7. Never hardcode mainnet addresses as defaults — use testnet addresses only
8. When showing a Stellar address in the UI always call `shortenAddress()` from `use-stellar`
9. Amount inputs must be `type="number"` with `step="0.0000001"` and `min="0"`
10. Always call `reset()` before a new `send()` to clear previous errors and results
</coding_rules>

---

## Pages to build

Build these five pages. Work through them one at a time. After creating
each file, state which file you created and what the user should see
when they open it in the browser.

<pages>

### 1. packages/demo/app/demo/account/page.tsx
Hook: `useAccount`
Shows: address input (prefilled with connected wallet), sequence number,
subentry count, all balances as a list, signers table, thresholds.
Interaction: User can type any G... address to inspect a different account.
Wallet required: No (can inspect any address, but defaults to connected wallet)

---

### 2. packages/demo/app/demo/send/page.tsx
Hook: `useSendPayment`
Shows: A form with destination address, asset selector (XLM / USDC), amount,
optional memo. A send button. After sending: tx hash, status badge.
Interaction: Full working send flow — Freighter popup should open for signing.
Wallet required: Yes — show a "connect wallet" prompt if not connected.
Pre-fill destination with a known testnet faucet address so user can test
without needing a second account:
`GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR`

---

### 3. packages/demo/app/demo/transaction/page.tsx
Hook: `useTransaction`
Shows: A hash input field. When a valid hash is entered fetch and display:
status badge (color-coded), ledger number, timestamp, fee paid.
Interaction: User pastes a tx hash to inspect it. Also show a note that they
can paste a hash from the send demo to see the result here.
Wallet required: No

---

### 4. packages/demo/app/demo/asset/page.tsx
Hook: `useAsset`
Shows: Pre-loaded with USDC on testnet. Fields: asset code input, issuer
input, fetch button. Displays: home domain, total supply, number of accounts.
Prefill USDC testnet values:
  code:   "USDC"
  issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
Wallet required: No

---

### 5. packages/demo/app/demo/soroban/page.tsx
Hook: `useSorobanContract`
Shows: contractId input, method input, a call button, raw result output.
Display a note that this hook is in active development and write calls
(requiring signing) are tracked in GitHub issue #8.
Prefill with a known read-only Soroban testnet contract if one is available,
otherwise leave inputs empty and let the user fill them.
Wallet required: Yes (connection required to simulate)

</pages>

---

## Thinking process

Before writing each file, think through these steps silently:

1. Which SDK hooks and utilities does this page import?
2. What state does this component need beyond what the hook provides?
3. What does the user interact with — inputs, buttons, or is it read-only?
4. What are the three states to handle: loading, error, data?
5. Does this hook require a connected wallet? If yes, add a guard.
6. What goes in the `code` prop of DemoCard (the usage snippet)?
7. What goes in the `children` of DemoCard (the live output)?

Only write the file after answering all seven questions mentally.

---

## How to run

After creating the files, confirm the user can test with:

```bash
# From the monorepo root
pnpm --filter use-stellar build   # build the SDK first

# Then in a second terminal
pnpm --filter @use-stellar/demo dev

# Open http://localhost:3000
# Install Freighter from https://freighter.app if not installed
# Switch Freighter to Testnet
# Fund your testnet account at https://laboratory.stellar.org/#account-creator
```