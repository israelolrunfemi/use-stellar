import Link from "next/link";

type HookCard = { hook: string; path: string; desc: string; comingSoon?: boolean };

const hooks: HookCard[] = [
  { hook: "useWallet",          path: "/demo/wallet",      desc: "Connect and disconnect a Stellar wallet" },
  { hook: "useBalance",         path: "/demo/balance",     desc: "Fetch XLM or any asset balance" },
  { hook: "useAccount",         path: "/demo/account",     desc: "Full account info — balances, signers, sequence", comingSoon: true },
  { hook: "useSendPayment",     path: "/demo/send",        desc: "Build, sign, and submit a payment", comingSoon: true },
  { hook: "useTransaction",     path: "/demo/transaction", desc: "Look up a transaction by hash", comingSoon: true },
  { hook: "useNetwork",         path: "/demo/network",     desc: "Current network and config" },
  { hook: "useAsset",           path: "/demo/asset",       desc: "Asset metadata — supply, home domain", comingSoon: true },
  { hook: "useSorobanContract", path: "/demo/soroban",     desc: "Call a Soroban smart contract", comingSoon: true },
];

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px" }}>

      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 40, fontWeight: 700, margin: "0 0 12px" }}>
          use-stellar
        </h1>
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
        <pre style={{
          background:   "#1a1a1a",
          borderRadius: 10,
          padding:      "20px 24px",
          fontSize:     14,
          lineHeight:   1.8,
          overflowX:    "auto",
          color:        "#e0e0e0",
        }}>
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

      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap:                 12,
      }}>
        {hooks.map(({ hook, path, desc, comingSoon }) => {
          const cardStyle: React.CSSProperties = {
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            gap:            12,
            padding:        "18px 20px",
            background:     "#1a1a1a",
            border:         "1px solid #2a2a2a",
            borderRadius:   10,
            textDecoration: "none",
            color:          "inherit",
            opacity:        comingSoon ? 0.5 : 1,
          };

          const body = (
            <>
              <span style={{ minWidth: 0 }}>
                <p style={{ margin: "0 0 6px", fontFamily: "monospace", fontSize: 15, color: "#7dd3fc" }}>
                  {hook}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
                  {comingSoon ? "Coming soon" : desc}
                </p>
              </span>
              {!comingSoon && (
                <span aria-hidden="true" style={{ fontSize: 18, color: "#555" }}>›</span>
              )}
            </>
          );

          return comingSoon ? (
            <div key={hook} style={cardStyle} aria-disabled="true">
              {body}
            </div>
          ) : (
            <Link
              key={hook}
              href={path}
              style={{ ...cardStyle, transition: "border-color 0.15s" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#7dd3fc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#2a2a2a";
              }}
            >
              {body}
            </Link>
          );
        })}
      </div>

      <p style={{ marginTop: 48, fontSize: 13, color: "#444" }}>
        Install: <code style={{ background: "#1a1a1a", padding: "2px 8px", borderRadius: 4 }}>
          npm install use-stellar
        </code>
      </p>
    </main>
  );
}

function badgeStyle(bg: string, border: string): React.CSSProperties {
  return {
    display:        "inline-block",
    padding:        "8px 16px",
    background:     bg,
    border:         `1px solid ${border}`,
    borderRadius:   8,
    color:          "#fff",
    fontSize:       14,
    fontWeight:     500,
    textDecoration: "none",
  };
}
