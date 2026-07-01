"use client"
import { useState } from "react"
import { useBalance, useWallet } from "use-stellar"
import { DemoCard } from "../../../components/DemoCard"

const WATCH_INTERVAL = 10_000

export default function BalanceDemo() {
  const { address } = useWallet()
  const [custom, setCustom] = useState("")
  const [watchLive, setWatch] = useState(true)
  const resolved = custom || address

  const xlm = useBalance({
    address: resolved,
    asset: "XLM",
    watch: watchLive,
    interval: WATCH_INTERVAL,
  })
  const usdc = useBalance({
    address: resolved,
    asset: { code: "USDC", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" },
  })

  return (
    <DemoCard
      hook="useBalance"
      description="Fetch the balance of XLM or any Stellar asset for an address. Pass watch: true to auto-refresh on an interval."
      code={`const { balance, lastUpdated } = useBalance({
  address:  "G...",   // or omit to use connected wallet
  asset:    "XLM",
  watch:    true,     // poll automatically
  interval: 10000,    // every 10s (default)
})`}
    >
      <style>{`
        @keyframes us-pulse-kf {
          0%   { opacity: 1;   transform: scale(1);   }
          50%  { opacity: 0.35; transform: scale(1.6); }
          100% { opacity: 1;   transform: scale(1);   }
        }
        .us-pulse { animation: us-pulse-kf 1.2s ease-in-out infinite; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          style={{
            background: "#111",
            border: "1px solid #333",
            borderRadius: 6,
            padding: "8px 10px",
            color: "#e0e0e0",
            fontSize: 12,
            fontFamily: "monospace",
          }}
          placeholder="Paste a G... address (or connect wallet)"
          value={custom}
          onChange={e => setCustom(e.target.value)}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#999",
            }}
          >
            {watchLive && (
              <span
                className="us-pulse"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "inline-block",
                }}
              />
            )}
            Watch live{watchLive ? ` — every ${WATCH_INTERVAL / 1000}s` : ""}
          </span>
          <Switch checked={watchLive} onChange={setWatch} />
        </div>

        {/* Native Balance */}
        <div style={{ marginBottom: 8 }}>
          <h4 style={{ color: "#888", fontSize: 12, marginBottom: 4, textTransform: "uppercase" }}>
            Native Balance
          </h4>
          <Row label="XLM" value={xlm.loading ? "..." : (xlm.balance ?? "—")} />
        </div>

        {/* Issued Assets */}
        <div style={{ marginBottom: 8 }}>
          <h4 style={{ color: "#888", fontSize: 12, marginBottom: 4, textTransform: "uppercase" }}>
            Issued Assets
          </h4>
          <Row label="USDC" value={usdc.loading ? "..." : (usdc.balance ?? "—")} />
        </div>

        {/* Liquidity Pool Shares */}
        <div style={{ marginBottom: 8 }}>
          <h4 style={{ color: "#888", fontSize: 12, marginBottom: 4, textTransform: "uppercase" }}>
            Liquidity Pool Shares
          </h4>
          {xlm.balances
            .filter(b => b.asset === "liquidity_pool_shares")
            .map((balance: { liquidityPoolId: string; balance: string }) => (
              <div key={balance.liquidityPoolId} style={{ marginBottom: 4 }}>
                <Row
                  label={`LP ${balance.liquidityPoolId.slice(0, 8)}...`}
                  value={balance.balance}
                />
                <div style={{ fontSize: 10, color: "#555", marginLeft: 16 }}>
                  Pool ID: {balance.liquidityPoolId}
                </div>
              </div>
            ))}
          {xlm.balances.filter(b => b.asset === "liquidity_pool_shares").length === 0 && (
            <div style={{ color: "#666", fontSize: 12, fontStyle: "italic" }}>
              No liquidity pool shares
            </div>
          )}
        </div>

        {xlm.lastUpdated && (
          <p
            style={{
              margin: 0,
              textAlign: "right",
              fontSize: 11,
              color: "#666",
              fontFamily: "monospace",
            }}
          >
            Last updated {xlm.lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {xlm.error && <p style={{ color: "#f87171", fontSize: 12 }}>{xlm.error}</p>}
        {xlm.error && <p style={{ color: "#f87171", fontSize: 12 }}>{xlm.error.message}</p>}
      </div>
    </DemoCard>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "#666" }}>{label}</span>
      <span style={{ color: "#e0e0e0", fontFamily: "monospace" }}>{value}</span>
    </div>
  )
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Toggle live balance updates"
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: 38,
        height: 20,
        padding: 0,
        borderRadius: 999,
        border: "1px solid #333",
        cursor: "pointer",
        background: checked ? "#22c55e" : "#222",
        transition: "background 0.2s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 1,
          left: checked ? 19 : 1,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
        }}
      />
    </button>
  )
}
