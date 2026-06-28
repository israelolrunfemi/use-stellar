"use client"
import { useWallet, shortenAddress } from "use-stellar"
import { DemoCard } from "../../../components/DemoCard"

export default function WalletDemo() {
  const { connect, disconnect, connected, address, connecting, error, network } = useWallet()

  return (
    <DemoCard
      hook="useWallet"
      description="Connect and disconnect a Stellar wallet. Currently supports Freighter — more wallets tracked as GitHub issues."
      code={`const { connect, disconnect, connected, address } = useWallet()

// Connect Freighter
await connect("freighter")

// Disconnect
disconnect()`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {connected ? (
          <>
            <Row label="Status" value="Connected ✓" color="#4ade80" />
            <Row label="Address" value={shortenAddress(address ?? "")} />
            <Row label="Network" value={network ?? ""} />
            <button onClick={disconnect} style={btnStyle("#c00")}>
              Disconnect
            </button>
          </>
        ) : (
          <>
            <Row label="Status" value="Not connected" color="#f87171" />
            {error && <Row label="Error" value={error} color="#f87171" />}
            <button
              onClick={() => connect("freighter")}
              disabled={connecting}
              style={btnStyle("#1d4ed8")}
            >
              {connecting ? "Connecting..." : "Connect Freighter"}
            </button>
          </>
        )}
      </div>
    </DemoCard>
  )
}

function Row({
  label,
  value,
  color = "#e0e0e0",
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "#666" }}>{label}</span>
      <span style={{ color, fontFamily: "monospace" }}>{value}</span>
    </div>
  )
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: "10px 20px",
    background: bg,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    marginTop: 8,
  }
}
