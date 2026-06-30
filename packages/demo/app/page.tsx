import Link from "next/link"

const hooks = [
  { name: "useWallet",          desc: "Connect Freighter, get address",               href: "/demo/wallet"      },
  { name: "useBalance",         desc: "Fetch XLM or any asset balance",               href: "/demo/balance"     },
  { name: "useAccount",         desc: "Full account info — balances, signers",        href: "/demo/account"     },
  { name: "useSendPayment",     desc: "Send XLM or USDC with one hook",               href: "/demo/send"        },
  { name: "useTransaction",     desc: "Fetch and watch a transaction by hash",        href: "/demo/transaction" },
  { name: "useNetwork",         desc: "Current network, testnet/mainnet helper",      href: "/demo/network"     },
  { name: "useAsset",           desc: "Asset metadata — supply, issuer, home domain", href: "/demo/asset"       },
  { name: "useSorobanContract", desc: "Call a read function on a Soroban contract",   href: "/demo/soroban"     },
  { name: "usePayments",        desc: "Fetch and paginate payment history",           href: "/demo/payments"    },
  { name: "useSorobanContract",   desc: "Call a read function on a Soroban contract",          href: "/demo/soroban"   },
  { name: "useClaimableBalance", desc: "Fetch claimable balances — airdrops, vesting, escrow", href: "/demo/claimable" },
];
interface HookCard {
  name: string
  desc: string
  href: string
}

const hooks: HookCard[] = [
  { name: "useWallet", desc: "Connect Freighter, get address", href: "/demo/wallet" },
  { name: "useBalance", desc: "Fetch XLM or any asset balance", href: "/demo/balance" },
  { name: "useAccount", desc: "Full account info — balances, signers", href: "/demo/account" },
  { name: "useSendPayment", desc: "Send XLM or USDC with one hook", href: "/demo/send" },
  {
    name: "useTransaction",
    desc: "Fetch and watch a transaction by hash",
    href: "/demo/transaction",
  },
  { name: "useNetwork", desc: "Current network, testnet/mainnet helper", href: "/demo/network" },
  { name: "useAsset", desc: "Asset metadata — supply, issuer, home domain", href: "/demo/asset" },
  {
    name: "useSorobanContract",
    desc: "Call a read function on a Soroban contract",
    href: "/demo/soroban",
  },
  {
    name: "useClaimableBalance",
    desc: "Fetch claimable balances — airdrops, vesting, escrow",
    href: "/demo/claimable",
  },
]

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 40, fontWeight: 700, margin: "0 0 12px" }}>use-stellar</h1>
        <p style={{ fontSize: 18, color: "#888", margin: 0, lineHeight: 1.6 }}>
          React hooks for the Stellar network. The wagmi of Stellar.
        </p>
        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          <a
            href="https://github.com/YOUR_HANDLE/use-stellar"
            style={badgeStyle("#1a1a1a", "#555")}
          >
            GitHub →
          </a>
          <a
            href="https://www.npmjs.com/package/use-stellar"
            style={badgeStyle("#cc3534", "#7a1f1e")}
          >
            npm →
          </a>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <pre
          style={{
            background: "#1a1a1a",
            borderRadius: 10,
            padding: "20px 24px",
            fontSize: 14,
            lineHeight: 1.8,
            overflowX: "auto",
            color: "#e0e0e0",
          }}
        >
          {`import { StellarProvider, useWallet, useBalance } from "use-stellar"

function App() {
  const { connect, address, connected } = useWallet()
  const { balance }                     = useBalance({ asset: "USDC" })

  return connected
    ? <p>Balance: {balance} USDC</p>
    : <button onClick={() => connect()}>Connect Freighter</button>
}`}
        </pre>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#aaa" }}>
        All hooks — click to see a live demo
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {hooks.map(hook => (
          <Link
            key={hook.name}
            href={hook.href}
            style={{
              display: "block",
              padding: "18px 20px",
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: 10,
              textDecoration: "none",
              color: "inherit",
              transition: "border-color 0.15s",
            }}
          >
            <p
              style={{ margin: "0 0 6px", fontFamily: "monospace", fontSize: 15, color: "#7dd3fc" }}
            >
              {hook.name}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>{hook.desc}</p>
          </Link>
        ))}
      </div>

      <p style={{ marginTop: 48, fontSize: 13, color: "#444" }}>
        Install:{" "}
        <code style={{ background: "#1a1a1a", padding: "2px 8px", borderRadius: 4 }}>
          npm install use-stellar
        </code>
      </p>
    </main>
  )
}

function badgeStyle(bg: string, border: string): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "8px 16px",
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
  }
}
