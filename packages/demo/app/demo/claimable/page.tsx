"use client"

import { useState } from "react"
import type { CSSProperties } from "react"
import { useClaimableBalance, useWallet } from "use-stellar"
import type { ClaimableBalance } from "use-stellar"
import { DemoCard } from "../../../components/DemoCard"

export default function ClaimableBalanceDemo() {
  const { address } = useWallet()
  const [input, setInput] = useState("")
  const resolvedAddress = input.trim() || address

  const { balances, loading, error, refetch } = useClaimableBalance({
    address: resolvedAddress,
  })

  return (
    <DemoCard
      hook="useClaimableBalance"
      description="Fetch claimable balances for a Stellar address. Used in airdrops, vesting schedules, and payment escrows."
      code={`const { balances, loading, error, refetch } = useClaimableBalance({
  address: "G...",  // or omit to use connected wallet
})`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={labelStyle}>Account address</label>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Paste a G... address (or connect wallet)"
          style={inputStyle}
        />
        <button
          onClick={refetch}
          disabled={!resolvedAddress || loading}
          style={buttonStyle(!resolvedAddress || loading)}
        >
          {loading ? "Loading..." : "Fetch claimable balances"}
        </button>

        {!resolvedAddress && (
          <p style={{ margin: 0, color: "#facc15", fontSize: 13 }}>
            Connect a wallet or paste any testnet G... address.
          </p>
        )}

        {error && <p style={{ margin: 0, color: "#f87171", fontSize: 13 }}>{error}</p>}

        {!loading && !error && resolvedAddress && balances.length === 0 && (
          <p style={{ margin: 0, color: "#666", fontSize: 13 }}>
            No claimable balances found for this address.
          </p>
        )}

        {balances.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ margin: 0, color: "#7dd3fc", fontSize: 13, fontFamily: "monospace" }}>
              {balances.length} claimable balance{balances.length !== 1 ? "s" : ""} found
            </p>
            {balances.map(balance => (
              <BalanceCard key={balance.id} balance={balance} />
            ))}
          </div>
        )}
      </div>
    </DemoCard>
  )
}

function BalanceCard({ balance }: { balance: ClaimableBalance }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={cardStyle}>
      <Row label="ID" value={`${balance.id.slice(0, 16)}...${balance.id.slice(-8)}`} />
      <Row label="Asset" value={balance.asset} />
      <Row label="Amount" value={balance.amount} highlight />
      {balance.sponsor && <Row label="Sponsor" value={`${balance.sponsor.slice(0, 8)}...`} />}
      <Row label="Claimants" value={String(balance.claimants.length)} />

      <button onClick={() => setExpanded(v => !v)} style={expandButtonStyle}>
        {expanded ? "Hide claimants ▲" : "Show claimants ▼"}
      </button>

      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
          {balance.claimants.map((c, i) => (
            <div key={c.destination} style={claimantRowStyle}>
              <span style={{ color: "#666", fontSize: 12, minWidth: 20 }}>#{i + 1}</span>
              <span
                style={{
                  color: "#e0e0e0",
                  fontFamily: "monospace",
                  fontSize: 12,
                  wordBreak: "break-all",
                }}
              >
                {c.destination}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
      <span style={{ color: "#666", flexShrink: 0 }}>{label}</span>
      <span
        style={{
          color: highlight ? "#4ade80" : "#e0e0e0",
          fontFamily: "monospace",
          textAlign: "right",
          wordBreak: "break-all",
        }}
      >
        {value}
      </span>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────

const labelStyle: CSSProperties = {
  color: "#666",
  fontSize: 13,
}

const inputStyle: CSSProperties = {
  background: "#111",
  border: "1px solid #333",
  borderRadius: 6,
  color: "#e0e0e0",
  padding: "8px 10px",
  fontSize: 13,
  fontFamily: "monospace",
  width: "100%",
  boxSizing: "border-box",
}

function buttonStyle(disabled: boolean): CSSProperties {
  return {
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    cursor: disabled ? "default" : "pointer",
    fontWeight: 500,
    fontSize: 14,
    opacity: disabled ? 0.5 : 1,
    background: "#7dd3fc",
    color: "#0f0f0f",
  }
}

const cardStyle: CSSProperties = {
  background: "#111",
  border: "1px solid #333",
  borderRadius: 8,
  padding: "12px 14px",
  display: "flex",
  flexDirection: "column",
  gap: 6,
}

const expandButtonStyle: CSSProperties = {
  marginTop: 4,
  background: "transparent",
  border: "none",
  color: "#7dd3fc",
  cursor: "pointer",
  fontSize: 12,
  padding: 0,
  textAlign: "left",
}

const claimantRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "flex-start",
  background: "#0a0a0a",
  borderRadius: 6,
  padding: "6px 8px",
}
