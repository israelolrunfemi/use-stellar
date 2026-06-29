# use-stellar

React hooks for the Stellar network. The simplest way to build dApps on Stellar.

```bash
pnpm install use-stellar
```

---

## The problem

Building a React app on Stellar means writing the same boilerplate every time — wallet connection, balance fetching, transaction submission, account loading. Every developer solves this from scratch.

`use-stellar` is the shared solution. One package. Clean hooks. Works with any React or Next.js app.

---

## Installation

Install `use-stellar` along with its peer dependency `@stellar/stellar-sdk`:

```bash
# npm
npm install use-stellar @stellar/stellar-sdk

# pnpm
pnpm add use-stellar @stellar/stellar-sdk

# yarn
yarn add use-stellar @stellar/stellar-sdk
```

---

## Getting started quickstart

Follow these steps to integrate `use-stellar` into your application.

### 1. Wrap your app in `StellarProvider`

At the root of your application (e.g., `main.tsx` in Vite/CRA, or `app/layout.tsx` in Next.js), wrap your component tree in `StellarProvider`. By default, the provider connects to **Testnet** (recommended for development).

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { StellarProvider } from "use-stellar";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StellarProvider network="testnet">
      <App />
    </StellarProvider>
  </React.StrictMode>
);
```

### 2. Connect a wallet

Use the `useWallet` hook to prompt wallet connection and display connection status.

```tsx
import { useWallet } from "use-stellar";

export function WalletConnect() {
  const { connected, connecting, address, error, connect, disconnect } = useWallet();

  if (connecting) return <button disabled>Connecting...</button>;

  if (connected) {
    return (
      <div>
        <p>Connected: <code>{address}</code></p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => connect("freighter")}>Connect Freighter</button>
      {error && <p style={{ color: "red" }}>{error.message}</p>}
    </div>
  );
}
```

### 3. Read XLM Balance

Use the `useBalance` hook to display the user's XLM balance. Pass `watch: true` to automatically poll and update the balance every 10 seconds.

```tsx
import { useBalance } from "use-stellar";

export function AccountBalance() {
  const { balance, loading, error } = useBalance({
    watch: true, // Auto-refreshes every 10s
  });

  if (loading) return <p>Loading balance...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error.message}</p>;

  return <p>XLM Balance: <strong>{balance ?? "0"}</strong> XLM</p>;
}
```

### 4. Send a testnet payment

Use the `useSendPayment` hook to submit payments. Ensure the user's wallet is connected before triggering this action.

> [!WARNING]
> **Safety Note:** Always test your application on the Stellar Testnet. Never use real XLM or real assets during development. The examples below target the SDF Testnet.

```tsx
import { useSendPayment } from "use-stellar";

export function SendPayment() {
  const { send, loading, error, result } = useSendPayment();

  const handlePayment = async () => {
    try {
      const outcome = await send({
        to: "GDLUW7G2E66W4J... [Replace with a valid testnet destination address]",
        asset: "XLM",
        amount: "1.5",
        memo: "Quickstart test payment",
      });
      console.log("Transaction submitted:", outcome.hash);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? "Sending..." : "Send 1.5 XLM"}
      </button>
      {result?.status === "success" && (
        <p style={{ color: "green" }}>Success! Hash: <code>{result.hash}</code></p>
      )}
      {error && <p style={{ color: "red" }}>Payment failed: {error.message}</p>}
    </div>
  );
}
```

---

## Wallet setup & funding

To test your application locally, you will need the Freighter browser wallet set up on the Stellar Testnet.

1. **Install Freighter**: Go to [freighter.app](https://www.freighter.app) and install the extension for Chrome, Firefox, Edge, or Brave.
2. **Switch Freighter to Testnet**:
   - Open Freighter, click the gear icon (Settings) in the top-right corner.
   - Select **Preferences** -> **Active Network**.
   - Select **Test Network**.
3. **Fund Your Account**:
   - Copy your Stellar public address from Freighter (starts with `G`).
   - Navigate to the [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#friendbot).
   - Paste your address and click **Get test network lumens**. This will activate your account on the testnet and fund it with 10,000 XLM.

---

## Troubleshooting

Here are solutions to common integration and runtime errors:

| Error / Issue | Probable Cause | Solution |
| :--- | :--- | :--- |
| `Freighter wallet not found. Install...` | The Freighter browser extension is missing or disabled in your browser. | Install the extension from [freighter.app](https://www.freighter.app) and ensure it is active. |
| `Wrong network. Switch Freighter to...` | Freighter is set to Mainnet (or another network) while `StellarProvider` is configured to `testnet` (or vice versa). | Open Freighter settings, select **Preferences** -> **Active Network**, and select the network configured in `StellarProvider`. |
| `Failed to fetch balance` | The Stellar address has not been funded yet and does not exist on the ledger. | Use the [Stellar Lab Friendbot](https://laboratory.stellar.org/#friendbot) to fund the address with testnet XLM before attempting to read its balance. |
| `Transaction failed` (e.g., during payment) | Insufficient balance, invalid destination address, missing asset trustline, or network timeout. | 1. Ensure the sender has enough XLM to cover the payment amount and the base transaction fee (0.00001 XLM).<br>2. Confirm the destination address is valid and exists on the active network.<br>3. Check developer console logs for the specific transaction error XDR. |

---

## Hooks

| Hook | Description |
|---|---|
| `useWallet` | Connect / disconnect Freighter, expose address and network |
| `useBalance` | Fetch XLM or any asset balance for an address |
| `useAccount` | Full account info — balances, sequence, signers, thresholds |
| `useSendPayment` | Send XLM or USDC, handles signing and submission |
| `useTransaction` | Fetch and watch a transaction by hash |
| `useNetwork` | Current network, Horizon and Soroban RPC URLs |
| `useAsset` | Asset metadata — supply, issuer, home domain, flags |
| `useSorobanContract` | Call a read function on any deployed Soroban contract |

---

## Error handling

Every hook exposes `error` as a typed `StellarError | null` rather than a raw
string. A `StellarError` is a real `Error` subclass with two extra fields:

- `code` — a stable, machine-readable [`StellarErrorCode`](packages/core/src/errors/codes.ts) (e.g. `NO_TRUSTLINE`, `INSUFFICIENT_BALANCE`, `WALLET_REQUEST_REJECTED`, `RATE_LIMITED`, `ACCOUNT_NOT_FOUND`, `NETWORK_ERROR`, `UNKNOWN`).
- `message` — a human-readable string you can render directly.

```tsx
import { useSendPayment } from "use-stellar";

function Send() {
  const { send, error } = useSendPayment();

  // Render the message...
  if (error) return <p>{error.message}</p>;

  // ...or branch on the stable code.
  // if (error?.code === "NO_TRUSTLINE") { /* prompt to add a trustline */ }
}
```

Any thrown value can be normalised with the shared helpers, which are also
exported for advanced use:

```ts
import { toStellarError, createStellarError } from "use-stellar";

const stellarError = toStellarError(unknownThrownValue); // → StellarError
throw createStellarError("WALLET_NOT_CONNECTED"); // build one directly
```

---

## Examples

### Check a balance

```tsx
import { useBalance } from "use-stellar";

function Balance() {
  const { balance, loading, error } = useBalance({
    address: "G...",   // or omit to use connected wallet address
    asset:   "XLM",
    watch:   true,     // auto-refresh every 10s
  });

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error.message}</p>;
  return <p>{balance} XLM</p>;
}
```

### Send a payment

```tsx
import { useSendPayment } from "use-stellar";

function SendButton() {
  const { send, loading, error, result } = useSendPayment();

  async function handleSend() {
    await send({
      to:     "GDEST...",
      asset:  "XLM",
      amount: "10",
      memo:   "thanks",
    });
  }

  if (result)  return <p>Sent! tx: {result.hash}</p>;
  if (loading) return <p>Sending...</p>;
  return <button onClick={handleSend}>Send 10 XLM</button>;
}
```

### Watch a transaction

```tsx
import { useTransaction } from "use-stellar";

function TxStatus({ hash }: { hash: string }) {
  const { transaction } = useTransaction({ hash, watch: true });

  return <p>Status: {transaction?.status ?? "pending"}</p>;
}
```

### Load account info

```tsx
import { useAccount } from "use-stellar";

function Account() {
  const { account, loading } = useAccount();

  if (loading || !account) return null;

  return (
    <div>
      <p>Sequence: {account.sequence}</p>
      <p>Subentries: {account.subentryCount}</p>
      <p>Balances: {account.balances.length}</p>
    </div>
  );
}
```

---

## StellarProvider

Wrap your app once at the root:

```tsx
import { StellarProvider } from "use-stellar";

<StellarProvider network="testnet">
  <App />
</StellarProvider>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `network` | `"testnet" \| "mainnet"` | `"testnet"` | Stellar network to connect to |

---

## Next.js App Router (SSR)

`use-stellar` is safe to import in server components — it never touches `window` or wallet extension APIs at module load time. However, wallet connection and transaction signing are browser-only, so any component that calls `useWallet`, `useSendPayment`, or other interactive hooks must be a client component.

### Pattern

Create a thin client wrapper for the provider and your interactive components:

```tsx
// app/providers.tsx
"use client";
import { StellarProvider } from "use-stellar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StellarProvider network="testnet">
      {children}
    </StellarProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

```tsx
// app/wallet-button.tsx
"use client";
import { useWallet } from "use-stellar";

export function WalletButton() {
  const { connect, disconnect, connected, address } = useWallet();

  return connected
    ? <button onClick={disconnect}>{address}</button>
    : <button onClick={() => connect()}>Connect Freighter</button>;
}
```

### Server-side behaviour

| Hook | Server-side behaviour |
|---|---|
| `StellarProvider` | Renders normally, no browser APIs used |
| `useWallet` | Returns disconnected state; `connect()` sets a clear error |
| `useBalance`, `useAccount`, `useTransaction`, `useAsset` | Fetch via Horizon — works server-side if an address is supplied |
| `useSendPayment` | `send()` throws a clear error if called before hydration |
| `useNetwork` | Pure context read — always safe |
| `isBrowser()` | Utility exported for your own SSR guards |

---

## Supported wallets

| Wallet | Status |
|---|---|
| Freighter | ✅ Supported |
| Albedo | Open issue — contributions welcome |
| Rabet | Open issue — contributions welcome |
| xBull | Open issue — contributions welcome |

---

## Project structure

```
use-stellar/
├── packages/
│   ├── core/       ← the hooks library (published to npm as use-stellar)
│   │   └── src/
│   │       ├── hooks/        ← one file per hook
│   │       ├── context/      ← StellarProvider
│   │       ├── types/        ← all TypeScript types
│   │       └── utils/        ← shared helpers
│   └── demo/       ← Next.js demo app (live at use-stellar.dev)
└── .github/        ← CI, issue templates
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). All contributions welcome — new hooks, new wallets, tests, docs. TypeScript only — no Rust or blockchain expertise needed.

---

## Roadmap

- [x] `useWallet` — Freighter connect / disconnect
- [x] `useBalance` — XLM and issued asset balances
- [x] `useAccount` — full account info
- [x] `useSendPayment` — sign and submit payments
- [x] `useTransaction` — fetch and watch by hash
- [x] `useNetwork` — network config
- [x] `useAsset` — asset metadata
- [x] `useSorobanContract` — read contract state
- [ ] Albedo wallet support
- [ ] Rabet wallet support
- [ ] `useOrderBook` — DEX order book data
- [ ] `usePaymentHistory` — paginated payment history
- [ ] `useTrustline` — add / remove trustlines
- [ ] React Native support

---

## License

MIT
