import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiTable } from "../../components/ApiTable";
import { Callout } from "../../components/Callout";
import { CodeBlock } from "../../components/CodeBlock";
import { DocsFrame, type NavGroup } from "../../components/DocsFrame";

const navGroups: NavGroup[] = [
  { title: "Getting started", items: [
    { label: "Installation", href: "/docs/getting-started" },
    { label: "Quick start", href: "/docs" },
    { label: "StellarProvider", href: "/docs/getting-started#provider" },
  ]},
  { title: "Hooks", items: [
    { label: "useWallet", href: "/docs/hooks/use-wallet" },
    { label: "useBalance", href: "/docs/hooks/use-balance" },
    { label: "useAccount", href: "/docs/hooks/use-account" },
    { label: "useSendPayment", href: "/docs/hooks/use-send-payment" },
    { label: "useTransaction", href: "/docs/hooks/use-transaction" },
    { label: "useNetwork", href: "/docs/hooks/use-network" },
    { label: "useAsset", href: "/docs/hooks/use-asset" },
    { label: "useSorobanContract", href: "/docs/hooks/use-soroban-contract" },
  ]},
  { title: "Guides", items: [
    { label: "TypeScript", href: "/docs/typescript" },
    { label: "Networks", href: "/docs/networks" },
    { label: "Wallets", href: "/docs/wallets" },
    { label: "Error handling", href: "/docs/errors" },
  ]},
];

const docPaths = [
  [],
  ["getting-started"],
  ["hooks", "use-wallet"],
  ["hooks", "use-balance"],
  ["hooks", "use-account"],
  ["hooks", "use-send-payment"],
  ["hooks", "use-transaction"],
  ["hooks", "use-network"],
  ["hooks", "use-asset"],
  ["hooks", "use-soroban-contract"],
  ["typescript"],
  ["networks"],
  ["wallets"],
  ["errors"],
];

export function generateStaticParams() {
  return docPaths.map(slug => ({ slug }));
}

const hookDocs = {
  "use-wallet": {
    title: "useWallet",
    lead: "Connect to Freighter and read the current wallet state from StellarProvider.",
    options: [],
    returns: [
      ["connected", "boolean", "Whether a wallet is connected."], ["address", "string | null", "Connected public key."], ["network", "StellarNetwork | null", "Network reported by wallet state."], ["wallet", "WalletType | null", "Selected wallet provider."], ["connecting", "boolean", "Connection request in progress."], ["error", "string | null", "Last connection error."], ["connect", "(wallet?: WalletType) => Promise<void>", "Connects to Freighter by default."], ["disconnect", "() => void", "Clears wallet state."],
    ],
    examples: [
      `const { connect, disconnect, connected, address } = useWallet()\n\nreturn connected ? <button onClick={disconnect}>{address}</button> : <button onClick={() => connect()}>Connect</button>`,
      `await connect("freighter")`,
      `if (error) return <p>{error}</p>`
    ]
  },
  "use-balance": {
    title: "useBalance",
    lead: "Fetch XLM or issued asset balances for the connected wallet or any Stellar address.",
    options: [["address", "string | null", "connected wallet", "Optional account public key."], ["asset", "Asset", "XLM", "Native XLM or { code, issuer }."], ["watch", "boolean", "false", "Refetch every 10 seconds."]],
    returns: [["balance", "string | null", "Matched asset balance."], ["balances", "Balance[]", "All parsed balances."], ["loading", "boolean", "Request state."], ["error", "string | null", "Last error."], ["refetch", "() => void", "Fetch again."]],
    examples: [`const { balance } = useBalance()`, `const usdc = { code: "USDC", issuer: "G..." }\nconst { balance } = useBalance({ asset: usdc })`, `const { balances, refetch } = useBalance({ address: "G...", watch: true })`]
  },
  "use-account": {
    title: "useAccount",
    lead: "Load account balances, sequence number, thresholds, and signer metadata.",
    options: [["address", "string | null", "connected wallet", "Optional account public key."]],
    returns: [["account", "AccountInfo | null", "Parsed account details."], ["loading", "boolean", "Request state."], ["error", "string | null", "Last error."], ["refetch", "() => void", "Fetch again."]],
    examples: [`const { account } = useAccount()`, `const { account } = useAccount({ address: "G..." })`, `account?.signers.map(signer => <li key={signer.key}>{signer.weight}</li>)`]
  },
  "use-send-payment": {
    title: "useSendPayment",
    lead: "Build, sign with Freighter, and submit a Stellar payment transaction.",
    options: [],
    returns: [["send", "(options: SendPaymentOptions) => Promise<SendPaymentResult>", "Submits a payment."], ["loading", "boolean", "Submit state."], ["error", "string | null", "Last payment error."], ["result", "SendPaymentResult | null", "Submitted hash and status."], ["reset", "() => void", "Clears error and result."]],
    examples: [`const { send } = useSendPayment()\nawait send({ to: "G...", asset: "XLM", amount: "10" })`, `await send({ to, asset: { code: "USDC", issuer }, amount: "5", memo: "invoice-42" })`, `const { loading, error, result, reset } = useSendPayment()`]
  },
  "use-transaction": {
    title: "useTransaction",
    lead: "Fetch transaction details and optionally poll until the transaction settles.",
    options: [["hash", "string | null", "required", "Transaction hash."], ["watch", "boolean", "false", "Poll every 3 seconds until success or failed."]],
    returns: [["transaction", "TransactionResult | null", "Hash, status, ledger, fee, and XDR."], ["loading", "boolean", "Request state."], ["error", "string | null", "Last error."], ["refetch", "() => void", "Fetch again."]],
    examples: [`const { transaction } = useTransaction({ hash })`, `const pending = useTransaction({ hash, watch: true })`, `if (transaction?.status === "success") console.log(transaction.ledger)`]
  },
  "use-network": {
    title: "useNetwork",
    lead: "Read the current Stellar network and endpoint configuration.",
    options: [],
    returns: [["network", "StellarNetwork", "testnet or mainnet."], ["networkConfig", "NetworkConfig", "Horizon and Soroban URLs."], ["isTestnet", "boolean", "True on testnet."], ["isMainnet", "boolean", "True on mainnet."]],
    examples: [`const { network, isTestnet } = useNetwork()`, `const { networkConfig } = useNetwork()\nconsole.log(networkConfig.horizonUrl)`, `return isMainnet ? <MainnetWarning /> : null`]
  },
  "use-asset": {
    title: "useAsset",
    lead: "Fetch issued asset supply, issuer, home domain, account count, and authorization flags.",
    options: [["code", "string", "required", "Asset code, for example USDC."], ["issuer", "string", "required", "Issuer public key."]],
    returns: [["asset", "AssetInfo | null", "Parsed asset metadata."], ["loading", "boolean", "Request state."], ["error", "string | null", "Last error."], ["refetch", "() => void", "Fetch again."]],
    examples: [`const { asset } = useAsset({ code: "USDC", issuer: "G..." })`, `asset?.flags.authRequired`, `const { loading, error, refetch } = useAsset({ code, issuer })`]
  },
  "use-soroban-contract": {
    title: "useSorobanContract",
    lead: "Call the current Soroban contract adapter placeholder and receive simulated contract data.",
    options: [["contractId", "string", "required", "Soroban contract ID."], ["method", "string", "required", "Contract method name."], ["args", "unknown[]", "undefined", "Defined in ContractCallOptions but not consumed by the current implementation."]],
    returns: [["data", "unknown | null", "Returned contract data."], ["loading", "boolean", "Request state."], ["error", "string | null", "Last error."], ["refetch", "() => void", "Call again."]],
    examples: [`const { data } = useSorobanContract({ contractId: "C...", method: "counter" })`, `const read = useSorobanContract({ contractId, method: "increment", args: [1] })`, `if (error) return <p>{error}</p>`]
  },
} as const;

export default async function DocsPage({ params }: { params: { slug?: string[] } }) {
  const path = params.slug?.join("/") ?? "";
  return <DocsFrame groups={navGroups}>{await renderDoc(path)}</DocsFrame>;
}

async function renderDoc(path: string) {
  if (path === "") return overview();
  if (path === "getting-started") return gettingStarted();
  if (path.startsWith("hooks/")) {
    const key = path.replace("hooks/", "") as keyof typeof hookDocs;
    const doc = hookDocs[key];
    if (!doc) notFound();
    return hookPage(doc);
  }
  if (path === "typescript") return typescriptPage();
  if (path === "networks") return networksPage();
  if (path === "wallets") return walletsPage();
  if (path === "errors") return errorsPage();
  notFound();
}

async function overview() {
  const quick = `import { StellarProvider, useWallet, useBalance } from "use-stellar"\n\nfunction App() {\n  return <StellarProvider network="testnet"><Dashboard /></StellarProvider>\n}\n\nfunction Dashboard() {\n  const { connect, connected } = useWallet()\n  const { balance } = useBalance({ asset: "XLM" })\n  return connected ? <p>{balance} XLM</p> : <button onClick={() => connect()}>Connect</button>\n}`;
  return <Article title="Documentation" lead="Everything needed to install, configure, and ship Stellar React apps with use-stellar.">
    {await CodeBlock({ code: quick })}
    <LinkGrid items={navGroups.flatMap(g => g.items).filter(i => !i.href.includes("#"))} />
  </Article>;
}

async function gettingStarted() {
  return <Article title="Getting started" lead="Install the package, add StellarProvider, then call hooks inside the provider tree.">
    {await CodeBlock({ code: "pnpm add use-stellar @stellar/stellar-sdk @stellar/freighter-api", lang: "bash" })}
    <h2 id="provider" style={h2}>StellarProvider</h2>
    {await CodeBlock({ code: `import { StellarProvider } from "use-stellar"\n\nexport function Providers({ children }: { children: React.ReactNode }) {\n  return <StellarProvider network="testnet">{children}</StellarProvider>\n}` })}
    <h2 style={h2}>First hook</h2>
    {await CodeBlock({ code: `import { useWallet } from "use-stellar"\n\nfunction ConnectWallet() {\n  const { connect, connected, address } = useWallet()\n  return connected ? <span>{address}</span> : <button onClick={() => connect()}>Connect Freighter</button>\n}` })}
  </Article>;
}

async function hookPage(doc: typeof hookDocs[keyof typeof hookDocs]) {
  return <Article title={doc.title} lead={doc.lead}>
    {doc.options.length > 0 ? <><h2 style={h2}>Options</h2><ApiTable rows={doc.options.map(([name, type, def, description]) => ({ name, type, default: def, description }))} /></> : <Callout type="tip">This hook does not take options. Call it directly inside a StellarProvider tree.</Callout>}
    <h2 style={h2}>Return values</h2>
    <ApiTable rows={doc.returns.map(([name, type, description]) => ({ name, type, description }))} />
    <h2 style={h2}>Examples</h2>
    {await Promise.all(doc.examples.map(code => CodeBlock({ code })))}
  </Article>;
}

async function typescriptPage() {
  return <Article title="TypeScript" lead="use-stellar exports the public types used by every hook.">
    {await CodeBlock({ code: `import type {\n  StellarNetwork, NetworkConfig, WalletType, WalletState, Asset,\n  Balance, AccountInfo, TransactionResult, SendPaymentOptions,\n  SendPaymentResult, StellarError, StellarErrorCode,
  ContractCallOptions, StellarContextValue\n} from "use-stellar"` })}
    {await CodeBlock({ code: `function labelAsset(asset: Asset) {\n  if (asset === "XLM") return "Native XLM"\n  return asset.code + ":" + asset.issuer\n}` })}
    <Callout type="info">Asset is a discriminated union by value: native XLM is the string "XLM", issued assets are objects with code and issuer.</Callout>
  </Article>;
}

async function networksPage() {
  return <Article title="Networks" lead="Choose testnet while building and mainnet only for production funds.">
    <ApiTable rows={[{ name: "testnet", type: "StellarNetwork", default: "default", description: "Uses SDF test endpoints and test assets." }, { name: "mainnet", type: "StellarNetwork", description: "Uses public mainnet endpoints for live assets." }]} />
    {await CodeBlock({ code: `<StellarProvider network="mainnet">\n  <App />\n</StellarProvider>` })}
    <Callout type="warning">Freighter must be switched to the same network as StellarProvider or useWallet will throw a wrong-network error.</Callout>
  </Article>;
}

async function walletsPage() {
  return <Article title="Wallets" lead="Freighter is implemented today. Albedo and Rabet are typed as future wallet targets.">
    <h2 style={h2}>Freighter</h2><p style={p}>Install the browser extension, create or import an account, select the same network as your provider, then call connect(). Screenshot guide: extension installed, network dropdown open, connection approval prompt.</p>
    {await CodeBlock({ code: `const { connect } = useWallet()\nawait connect("freighter")` })}
    <h2 style={h2}>Albedo</h2><p style={p}>WalletType includes "albedo", but the current connector throws a not-yet-supported error. Track GitHub issues for implementation work.</p>
    <h2 style={h2}>Coming soon</h2><p style={p}>Albedo, Rabet, WalletConnect-style mobile flows, and provider capability detection.</p>
  </Article>;
}

async function errorsPage() {
  return <Article title="Error handling" lead="Normalize hook errors into the exported StellarError shape when you need consistent UI states.">
    <ApiTable rows={[{ name: "wallet_missing", type: "StellarErrorCode", description: "Freighter is not installed or unavailable." }, { name: "wrong_network", type: "StellarErrorCode", description: "Wallet and provider network differ." }, { name: "horizon_error", type: "StellarErrorCode", description: "Horizon request failed." }, { name: "transaction_failed", type: "StellarErrorCode", description: "Signing or submission failed." }, { name: "contract_error", type: "StellarErrorCode", description: "Soroban contract call failed." }, { name: "unknown", type: "StellarErrorCode", description: "Fallback for unexpected errors." }]} />
    {await CodeBlock({ code: `import type { StellarError } from "use-stellar"

const walletMissing: StellarError = {
  code: "wallet_missing",
  message: "Install Freighter and try again",
}` })}
    {await CodeBlock({ code: `const { error } = useBalance({ watch: true })

if (error) {
  return <ErrorNotice message={error} />
}` })}
  </Article>;
}
function Article({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return <article><h1 style={{ margin: "0 0 12px", fontSize: 44, lineHeight: 1.1 }}>{title}</h1><p style={{ ...p, fontSize: 18, marginBottom: 30 }}>{lead}</p><div style={{ display: "grid", gap: 22 }}>{children}</div></article>;
}

function LinkGrid({ items }: { items: { label: string; href: string }[] }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>{items.map(item => <Link key={item.href} href={item.href} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 16, color: "#f0f0f0", textDecoration: "none" }}>{item.label}</Link>)}</div>;
}

const h2: CSSProperties = { margin: "14px 0 0", fontSize: 24 };
const p: CSSProperties = { color: "#a8a8a8", lineHeight: 1.7 };
