# use-stellar

> React hooks for building on the Stellar network.

`use-stellar` is a collection of React hooks that abstract the [Stellar SDK](https://github.com/stellar/js-stellar-sdk) and wallet APIs into a simple, typed interface. Instead of writing hundreds of lines of boilerplate to connect a wallet, fetch balances, or submit transactions, you get clean hooks that handle all of that for you.

```tsx
import { useWallet, useBalance, useSendPayment } from "use-stellar";

function PayButton() {
  const { connected, connect }  = useWallet();
  const { balance }             = useBalance();
  const { send, loading }       = useSendPayment();

  if (!connected) {
    return <button onClick={() => connect()}>Connect wallet</button>;
  }

  return (
    <div>
      <p>Balance: {balance} XLM</p>
      <button
        onClick={() => send({ to: "G...", asset: "XLM", amount: "10" })}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send 10 XLM"}
      </button>
    </div>
  );
}
```

---

## Table of contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Provider setup](#provider-setup)
- [Hooks](#hooks)
  - [useWallet](#usewallet)
  - [useBalance](#usebalance)
  - [useAccount](#useaccount)
  - [useSendPayment](#usesendpayment)
  - [useTransaction](#usetransaction)
  - [useNetwork](#usenetwork)
  - [useFriendbot](#usefriendbot)
  - [useAsset](#useasset)
  - [useSorobanContract](#usesorobancontract)
- [TypeScript](#typescript)
- [Network configuration](#network-configuration)
- [Error handling](#error-handling)
- [Supported wallets](#supported-wallets)
- [Contributing](#contributing)
- [License](#license)

---

## Requirements

Before installing `use-stellar`, make sure your project meets these requirements:

| Requirement | Version |
|---|---|
| Node.js | 18 or later |
| React | 18 or later |
| TypeScript (optional) | 5.0 or later |

`use-stellar` also requires the [Freighter browser extension](https://freighter.app) to be installed for wallet connection to work. Freighter is a free Stellar wallet extension available for Chrome and Firefox.

---

## Installation

Install `use-stellar` and its peer dependency using your preferred package manager:

```bash
# npm
npm install use-stellar @stellar/stellar-sdk

# pnpm
pnpm add use-stellar @stellar/stellar-sdk

# yarn
yarn add use-stellar @stellar/stellar-sdk
```

> **Note:** `@stellar/stellar-sdk` is a peer dependency. It must be installed alongside `use-stellar` in your project.

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
      {error && <p style={{ color: "red" }}>{error}</p>}
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
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

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
      {error && <p style={{ color: "red" }}>Payment failed: {error}</p>}
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

## Provider setup

Every hook in `use-stellar` reads its configuration from `StellarProvider`. You must wrap your application — or at minimum the part that uses Stellar hooks — in this provider.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `network` | `"testnet"` \| `"mainnet"` | `"testnet"` | The Stellar network to connect to |
| `children` | `ReactNode` | — | Your application |

### Example

```tsx
import { StellarProvider } from "use-stellar";

// Development — connect to testnet
<StellarProvider network="testnet">
  <App />
</StellarProvider>

// Production — connect to mainnet
<StellarProvider network="mainnet">
  <App />
</StellarProvider>
```

> **Testnet vs mainnet:** Testnet uses fake tokens and is free to use. Use it during development. Mainnet uses real tokens with real value. Never test on mainnet.

---

## Hooks

### useWallet

Connects and disconnects a Stellar wallet. Exposes the connected address and connection state.

#### Usage

```tsx
import { useWallet } from "use-stellar";

function MyComponent() {
  const {
    connected,   // boolean — whether a wallet is connected
    connecting,  // boolean — true while the connection is in progress
    address,     // string | null — the connected Stellar address (G...)
    network,     // "testnet" | "mainnet" | null
    wallet,      // "freighter" | "albedo" | "rabet" | null
    error,       // string | null — last connection error
    connect,     // (wallet?: WalletType) => Promise<void>
    disconnect,  // () => void
  } = useWallet();
}
```

#### Return values

| Property | Type | Description |
|---|---|---|
| `connected` | `boolean` | `true` if a wallet is currently connected |
| `connecting` | `boolean` | `true` while a wallet connection is in progress |
| `address` | `string \| null` | The connected wallet's Stellar address, or `null` if disconnected |
| `network` | `StellarNetwork \| null` | The network the connected wallet is on |
| `wallet` | `WalletType \| null` | Which wallet is connected (`"freighter"`, etc.) |
| `error` | `string \| null` | The error message from the last failed connection attempt |
| `connect` | `(wallet?: WalletType) => Promise<void>` | Call this to initiate wallet connection |
| `disconnect` | `() => void` | Call this to disconnect the wallet |

#### Parameters

`connect` accepts an optional wallet type:

```tsx
connect()              // defaults to Freighter
connect("freighter")   // explicitly use Freighter
```

#### Examples

**Basic connect / disconnect button:**

```tsx
import { useWallet } from "use-stellar";

export function ConnectButton() {
  const { connected, connecting, address, error, connect, disconnect } = useWallet();

  if (connecting) {
    return <button disabled>Connecting...</button>;
  }

  if (connected) {
    return (
      <button onClick={disconnect}>
        {address!.slice(0, 4)}...{address!.slice(-4)}
      </button>
    );
  }

  return (
    <>
      <button onClick={() => connect()}>Connect wallet</button>
      {error && <p className="error">{error}</p>}
    </>
  );
}
```

**Gate content behind wallet connection:**

```tsx
import { useWallet } from "use-stellar";

export function ProtectedPage() {
  const { connected, connect } = useWallet();

  if (!connected) {
    return (
      <div>
        <p>You need to connect your wallet to continue.</p>
        <button onClick={() => connect()}>Connect Freighter</button>
      </div>
    );
  }

  return <div>Welcome! You are connected.</div>;
}
```

---

### useBalance

Fetches the balance of any Stellar asset for any address. Optionally polls for live updates.

#### Usage

```tsx
import { useBalance } from "use-stellar";

function MyComponent() {
  const {
    balance,   // string | null — the balance of the requested asset
    balances,  // Balance[] — all balances for the account
    loading,   // boolean
    error,     // string | null
    refetch,   // () => void — manually re-fetch
  } = useBalance();
}
```

#### Options

Pass an options object to customise the behaviour:

| Option | Type | Default | Description |
|---|---|---|---|
| `address` | `string \| null` | Connected wallet address | The Stellar address to fetch balances for. Defaults to the connected wallet. |
| `asset` | `Asset` | `"XLM"` | The asset to return in `balance`. See [asset format](#asset-format). |
| `watch` | `boolean` | `false` | When `true`, re-fetches every 10 seconds automatically |

#### Return values

| Property | Type | Description |
|---|---|---|
| `balance` | `string \| null` | The balance of the requested `asset`, as a decimal string (e.g. `"100.5000000"`). `null` if no trustline exists or address not loaded yet. |
| `balances` | `Balance[]` | All asset balances for the account |
| `loading` | `boolean` | `true` while the first fetch is in progress |
| `error` | `string \| null` | Error message if the fetch failed |
| `refetch` | `() => void` | Manually trigger a re-fetch |

#### Asset format

`useBalance` accepts an `asset` option that determines which balance is returned in `balance`. An asset is either:

```tsx
// Native XLM
asset: "XLM"

// Any issued asset (USDC, AQUA, etc.)
asset: { code: "USDC", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" }
```

#### Examples

**XLM balance of the connected wallet:**

```tsx
import { useBalance } from "use-stellar";

export function XlmBalance() {
  const { balance, loading, error } = useBalance();

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error}</p>;

  return <p>XLM Balance: {balance ?? "0"}</p>;
}
```

**USDC balance:**

```tsx
import { useBalance } from "use-stellar";

const USDC = {
  code:   "USDC",
  issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
};

export function UsdcBalance() {
  const { balance, loading } = useBalance({ asset: USDC });

  return <p>USDC Balance: {loading ? "..." : (balance ?? "0")}</p>;
}
```

**Live balance with polling:**

```tsx
// Re-fetches every 10 seconds automatically
const { balance } = useBalance({ watch: true });
```

**Balance of a specific address:**

```tsx
const { balance } = useBalance({
  address: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN",
  asset:   "XLM",
});
```

**All balances for an account:**

```tsx
const { balances } = useBalance();

return (
  <ul>
    {balances.map((b, i) => (
      <li key={i}>
        {b.asset === "XLM" ? "XLM" : b.asset.code}: {b.balance}
      </li>
    ))}
  </ul>
);
```

---

### useAccount

Fetches full account information from Horizon — balances, signers, sequence number, thresholds, and flags.

#### Usage

```tsx
import { useAccount } from "use-stellar";

function MyComponent() {
  const {
    data,     // AccountInfo | null
    loading,  // boolean
    error,    // string | null
    refetch,  // () => void
  } = useAccount();
}
```

#### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `address` | `string` (optional) | Connected wallet address | The address to fetch. Defaults to the connected wallet. |

#### `AccountInfo` shape

```ts
interface AccountInfo {
  address:       string;
  sequence:      string;    // current sequence number
  balances:      Balance[]; // all asset balances
  subentryCount: number;    // number of subentries (trustlines, offers, etc.)
  thresholds: {
    lowThreshold:  number;
    medThreshold:  number;
    highThreshold: number;
  };
  signers: {
    key:    string;  // signer Stellar address
    weight: number;
    type:   string;
  }[];
}
```

#### Examples

**Show full account info:**

```tsx
import { useAccount } from "use-stellar";

export function AccountInfo() {
  const { data: account, loading, error } = useAccount();

  if (loading) return <p>Loading account...</p>;
  if (error)   return <p>Error: {error}</p>;
  if (!account) return <p>No account loaded</p>;

  return (
    <div>
      <p>Address: {account.address}</p>
      <p>Sequence: {account.sequence}</p>
      <p>Subentries: {account.subentryCount}</p>
      <p>Signers: {account.signers.length}</p>
    </div>
  );
}
```

**Check if account has multiple signers (multisig):**

```tsx
const { data: account } = useAccount();
const isMultisig = account ? account.signers.length > 1 : false;
```

**Fetch a different address:**

```tsx
const { data: account } = useAccount("GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN");
```

---

### useSendPayment

Builds, signs, and submits a Stellar payment transaction. Uses the connected wallet to sign.

#### Usage

```tsx
import { useSendPayment } from "use-stellar";

function MyComponent() {
  const {
    send,     // (options: SendPaymentOptions) => Promise<SendPaymentResult>
    loading,  // boolean — true while tx is being built/signed/submitted
    error,    // string | null
    result,   // SendPaymentResult | null — the result of the last send
    reset,    // () => void — clear error and result
  } = useSendPayment();
}
```

#### `SendPaymentOptions`

| Property | Type | Required | Description |
|---|---|---|---|
| `to` | `string` | Yes | Destination Stellar address (must start with `G`) |
| `asset` | `Asset` | Yes | Asset to send — `"XLM"` or `{ code, issuer }` |
| `amount` | `string` | Yes | Amount as a string, e.g. `"10"` or `"0.5"` |
| `memo` | `string` | No | Optional text memo attached to the transaction |

> **Why is `amount` a string?** JavaScript floating point arithmetic is imprecise. Using a string avoids rounding errors when working with financial values. Pass amounts as strings: `"10"` not `10`.

#### `SendPaymentResult`

```ts
interface SendPaymentResult {
  hash:   string;           // transaction hash on Stellar
  status: TransactionStatus; // "success" | "failed" | "pending" | "not_found"
}
```

#### Examples

**Send XLM:**

```tsx
import { useSendPayment } from "use-stellar";

export function SendXlm() {
  const { send, loading, error, result } = useSendPayment();

  async function handleSend() {
    await send({
      to:     "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN",
      asset:  "XLM",
      amount: "10",
    });
  }

  return (
    <div>
      <button onClick={handleSend} disabled={loading}>
        {loading ? "Sending..." : "Send 10 XLM"}
      </button>
      {error  && <p style={{ color: "red" }}>Error: {error}</p>}
      {result && <p style={{ color: "green" }}>Sent! Hash: {result.hash}</p>}
    </div>
  );
}
```

**Send USDC with a memo:**

```tsx
const { send } = useSendPayment();

await send({
  to:    "G...",
  asset: { code: "USDC", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" },
  amount: "50",
  memo:   "Invoice #42",
});
```

**Full send form:**

```tsx
import { useState } from "react";
import { useSendPayment, useWallet } from "use-stellar";

export function SendForm() {
  const { connected }                        = useWallet();
  const { send, loading, error, result, reset } = useSendPayment();

  const [to,     setTo]     = useState("");
  const [amount, setAmount] = useState("");

  if (!connected) return <p>Connect your wallet first.</p>;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        reset();
        await send({ to, asset: "XLM", amount });
      }}
    >
      <input
        placeholder="Destination address (G...)"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0"
        step="0.0000001"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send XLM"}
      </button>
      {error  && <p style={{ color: "red" }}>{error}</p>}
      {result && <p style={{ color: "green" }}>Transaction confirmed: {result.hash}</p>}
    </form>
  );
}
```

---

### useTransaction

Fetches a transaction by its hash. Useful for checking the status of a transaction after submission.

#### Usage

```tsx
import { useTransaction } from "use-stellar";

function MyComponent() {
  const {
    data,     // TransactionResult | null
    loading,  // boolean
    error,    // string | null
    refetch,  // () => void
  } = useTransaction("abc123...");
}
```

#### Parameters

| Parameter | Type | Description |
|---|---|---|
| `hash` | `string \| null \| undefined` | The transaction hash to look up. Pass `null` or `undefined` to skip fetching. |

#### `TransactionResult`

```ts
interface TransactionResult {
  hash:       string;
  status:     "pending" | "success" | "failed" | "not_found";
  ledger?:    number;
  createdAt?: string;
  fee?:       string;
}
```

#### Examples

**Check a transaction after sending:**

```tsx
import { useState } from "react";
import { useSendPayment, useTransaction } from "use-stellar";

export function SendAndTrack() {
  const [hash, setHash]                  = useState<string | null>(null);
  const { send, loading: sending }       = useSendPayment();
  const { data: tx, loading: fetching }  = useTransaction(hash);

  async function handleSend() {
    const result = await send({ to: "G...", asset: "XLM", amount: "1" });
    if (result) setHash(result.hash);
  }

  return (
    <div>
      <button onClick={handleSend} disabled={sending}>
        {sending ? "Sending..." : "Send 1 XLM"}
      </button>

      {hash && (
        <div>
          <p>Hash: {hash}</p>
          <p>Status: {fetching ? "checking..." : tx?.status}</p>
          {tx?.ledger && <p>Ledger: {tx.ledger}</p>}
        </div>
      )}
    </div>
  );
}
```

---

### useNetwork

Returns the current network configuration. Useful for displaying the active network to users or conditionally rendering content based on which network is active.

### useFriendbot

A safe, testnet-only helper for funding a Stellar testnet account via Friendbot. If a wallet is connected, it uses the connected address by default. Mainnet calls return a clear error.

#### Usage

```tsx
import { useFriendbot } from "use-stellar";

function FundAccountButton() {
  const { fund, loading, error, hash, funded } = useFriendbot();

  return (
    <div>
      <button onClick={() => fund()} disabled={loading}>
        {loading ? "Funding..." : "Fund testnet account"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {funded && hash && <p>Funded: {hash}</p>}
    </div>
  );
}
```

#### Return values

| Property | Type | Description |
|---|---|---|
| `loading` | `boolean` | `true` while Friendbot funding is in progress |
| `error` | `string \| null` | Clear error message for missing addresses or mainnet usage |
| `hash` | `string \| null` | The Friendbot transaction hash returned by the API |
| `funded` | `boolean` | `true` when funding completed successfully |
| `fund` | `(address?: string \| null) => Promise<void>` | Call this to request funding for a testnet address |

---

#### Usage

```tsx
import { useNetwork } from "use-stellar";

function MyComponent() {
  const {
    network,       // "testnet" | "mainnet"
    networkConfig, // { network, horizonUrl, sorobanUrl }
    isTestnet,     // boolean shorthand
    isMainnet,     // boolean shorthand
  } = useNetwork();
}
```

#### Examples

**Show a testnet warning banner:**

```tsx
import { useNetwork } from "use-stellar";

export function NetworkBanner() {
  const { isTestnet } = useNetwork();

  if (!isTestnet) return null;

  return (
    <div style={{ background: "orange", padding: "8px", textAlign: "center" }}>
      You are on testnet. Tokens have no real value.
    </div>
  );
}
```

**Display the current Horizon URL:**

```tsx
const { networkConfig } = useNetwork();
console.log(networkConfig.horizonUrl); // "https://horizon-testnet.stellar.org"
```

---

### useAsset

Fetches metadata about a Stellar asset — total supply, number of trustlines, and the issuer's home domain.

#### Usage

```tsx
import { useAsset } from "use-stellar";

const { data, loading, error, refetch } = useAsset("USDC", "GA5Z...");
```

#### Parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | `string` | The asset code, e.g. `"USDC"` |
| `issuer` | `string` | The issuer's Stellar address |

#### Example

```tsx
import { useAsset } from "use-stellar";

export function AssetInfo() {
  const { data, loading, error } = useAsset(
    "USDC",
    "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
  );

  if (loading) return <p>Loading asset info...</p>;
  if (error)   return <p>Error: {error}</p>;
  if (!data)   return null;

  return (
    <div>
      <p>Code: {data.code}</p>
      <p>Home domain: {data.homeDomain ?? "not set"}</p>
      <p>Total supply: {data.supply}</p>
      <p>Trustlines: {data.numAccounts}</p>
    </div>
  );
}
```

---

### useSorobanContract

Calls a read function on a deployed Soroban smart contract.

> **Note:** This hook currently supports read-only simulation calls. Write calls (with signing) are tracked in [GitHub issue #8](https://github.com/YOUR_HANDLE/use-stellar/issues/8) — contributions welcome.

#### Usage

```tsx
import { useSorobanContract } from "use-stellar";

function MyComponent() {
  const {
    call,     // (options: ContractCallOptions) => Promise<unknown>
    loading,  // boolean
    error,    // string | null
    result,   // unknown — the return value from the contract
  } = useSorobanContract();
}
```

#### `ContractCallOptions`

| Property | Type | Required | Description |
|---|---|---|---|
| `contractId` | `string` | Yes | The deployed contract address (starts with `C`) |
| `method` | `string` | Yes | The contract function name to call |
| `args` | `unknown[]` | No | Arguments to pass to the function |

#### Example

```tsx
import { useSorobanContract } from "use-stellar";

export function ContractReader() {
  const { call, loading, error, result } = useSorobanContract();

  async function readPrice() {
    await call({
      contractId: "CABC123...",
      method:     "get_price",
      args:       ["XLM"],
    });
  }

  return (
    <div>
      <button onClick={readPrice} disabled={loading}>
        {loading ? "Reading..." : "Read contract"}
      </button>
      {error  && <p style={{ color: "red" }}>{error}</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

---

## TypeScript

`use-stellar` is written in TypeScript and ships with full type definitions. No additional `@types` package is needed.

### Importing types

```ts
import type {
  StellarNetwork,     // "testnet" | "mainnet"
  NetworkConfig,      // { network, horizonUrl, sorobanUrl }
  WalletType,         // "freighter" | "albedo" | "rabet"
  WalletState,        // { connected, address, network, wallet, connecting, error }
  Asset,              // "XLM" | { code: string, issuer: string }
  NativeAsset,        // "XLM"
  IssuedAsset,        // { code: string, issuer: string }
  Balance,            // { asset, balance, limit?, buying?, selling? }
  AccountInfo,        // full account shape
  TransactionResult,  // { hash, status, ledger?, createdAt?, fee? }
  TransactionStatus,  // "pending" | "success" | "failed" | "not_found"
  SendPaymentOptions, // { to, asset, amount, memo? }
  SendPaymentResult,  // { hash, status }
  ContractCallOptions,// { contractId, method, args? }
} from "use-stellar";
```

### Working with `Asset`

The `Asset` type is a discriminated union. When working with it you can check whether it is native or issued:

```ts
import type { Asset, NativeAsset, IssuedAsset } from "use-stellar";

function getAssetCode(asset: Asset): string {
  if (asset === "XLM") {
    return "XLM";                    // NativeAsset
  }
  return (asset as IssuedAsset).code; // IssuedAsset
}
```

---

## Network configuration

### Switching between testnet and mainnet

Pass the `network` prop to `StellarProvider`:

```tsx
// testnet (development)
<StellarProvider network="testnet">

// mainnet (production)
<StellarProvider network="mainnet">
```

### Reading network config in a hook

All hooks read the network from `StellarProvider` automatically. You can also access the full config directly:

```tsx
import { useNetwork } from "use-stellar";

const { networkConfig } = useNetwork();

// networkConfig.horizonUrl   — Horizon REST API endpoint
// networkConfig.sorobanUrl   — Soroban RPC endpoint
// networkConfig.network      — "testnet" | "mainnet"
```

### Default endpoints

| Network | Horizon URL | Soroban RPC URL |
|---|---|---|
| testnet | `https://horizon-testnet.stellar.org` | `https://soroban-testnet.stellar.org` |
| mainnet | `https://horizon.stellar.org` | `https://soroban.stellar.org` |

---

## Error handling & troubleshooting

All hooks expose an `error` string when something goes wrong. Errors are human-readable messages you can display directly to users.

### Pattern

```tsx
const { data, loading, error, refetch } = useBalance();

if (loading) return <p>Loading...</p>;
if (error)   return <p>{error} — <button onClick={refetch}>Retry</button></p>;
if (!data)   return null;

return <p>Balance: {data.balance}</p>;
```

### Common errors

| Error / Issue | Probable Cause | Solution |
| :--- | :--- | :--- |
| `Freighter wallet not found. Install...` | The Freighter browser extension is missing or disabled in your browser. | Install the extension from [freighter.app](https://www.freighter.app) and ensure it is active. |
| `Wrong network. Switch Freighter to...` | Freighter is set to Mainnet (or another network) while `StellarProvider` is configured to `testnet` (or vice versa). | Open Freighter settings, select **Preferences** -> **Active Network**, and select the network configured in `StellarProvider`. |
| `Failed to fetch balance` | The Stellar address has not been funded yet and does not exist on the ledger. | Use the [Stellar Lab Friendbot](https://laboratory.stellar.org/#friendbot) to fund the address with testnet XLM before attempting to read its balance. |
| `Transaction failed` (e.g., during payment) | Insufficient balance, invalid destination address, missing asset trustline, or network timeout. | 1. Ensure the sender has enough XLM to cover the payment amount and the base transaction fee (0.00001 XLM).<br>2. Confirm the destination address is valid and exists on the active network.<br>3. Check developer console logs for the specific transaction error XDR. |

---

## Supported wallets

| Wallet | Status | Notes |
|---|---|---|
| [Freighter](https://freighter.app) | Supported | Default wallet |
| Albedo | Coming soon | Tracked in [issue #3](https://github.com/YOUR_HANDLE/use-stellar/issues/3) |
| Rabet | Coming soon | Tracked in [issue #4](https://github.com/YOUR_HANDLE/use-stellar/issues/4) |

Contributions for new wallet integrations are welcome — see [CONTRIBUTING.md](https://github.com/YOUR_HANDLE/use-stellar/blob/main/CONTRIBUTING.md).

---

## Contributing

`use-stellar` is open source and welcomes contributions. Every hook is a self-contained TypeScript file — you do not need Rust or blockchain expertise to contribute.

See [CONTRIBUTING.md](https://github.com/YOUR_HANDLE/use-stellar/blob/main/CONTRIBUTING.md) for setup instructions and a guide to adding new hooks and wallet integrations.

```bash
git clone https://github.com/YOUR_HANDLE/use-stellar
cd use-stellar
pnpm install
pnpm --filter use-stellar build
pnpm --filter @use-stellar/demo dev
```

---

## License

MIT © [RACEEY](https://github.com/israelolrunfemi)