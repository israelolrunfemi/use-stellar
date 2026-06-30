"use client"

import { useState } from "react"
import type { CSSProperties } from "react"
import { shortenAddress, useTransaction } from "use-stellar"
import { DemoCard } from "../../../components/DemoCard"

export default function TransactionDemo() {
  const [hash, setHash] = useState("")
  const { transaction, loading, error, refetch } = useTransaction({
    hash: hash.trim() || null,
    watch: true,
  })

  return (
    <DemoCard
      hook="useTransaction"
      description="Inspect a Stellar transaction hash and watch pending transactions until they settle."
      code={`const { transaction, loading, error, refetch } = useTransaction({
  hash: "abc...",
  watch: true,
})`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Text color="#666">Paste a hash from the Send demo to see it here</Text>
        <input
          value={hash}
          onChange={event => setHash(event.target.value)}
          placeholder="Transaction hash"
          style={inputStyle}
        />
        <button
          onClick={refetch}
          disabled={!hash.trim() || loading}
          style={buttonStyle(!hash.trim() || loading)}
        >
          {loading ? "Loading..." : "Fetch transaction"}
        </button>

        {error && <Text color="#f87171">{error.message}</Text>}
        {!hash.trim() && <Text color="#facc15">Enter a transaction hash to inspect it.</Text>}
        {transaction && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <StatusBadge status={transaction.status} />
            <Row label="Hash" value={shortenAddress(transaction.hash)} />
            <Row
              label="Ledger"
              value={transaction.ledger === undefined ? "-" : String(transaction.ledger)}
            />
            <Row label="Timestamp" value={transaction.createdAt ?? "-"} />
            <Row label="Fee paid" value={transaction.fee ?? "-"} />
          </div>
        )}
      </div>
    </DemoCard>
  )
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "success"
      ? "#4ade80"
      : status === "failed" || status === "not_found"
        ? "#f87171"
        : "#facc15"
  return <span style={{ color, fontFamily: "monospace", fontSize: 13 }}>Status: {status}</span>
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
      <span style={{ color: "#666", flexShrink: 0 }}>{label}</span>
      <span
        style={{
          color: "#e0e0e0",
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

function Text({ children, color = "#e0e0e0" }: { children: string; color?: string }) {
  return <p style={{ margin: 0, color, fontSize: 13 }}>{children}</p>
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
