"use client";
import { useWallet, useFriendbot, shortenAddress } from "use-stellar";
import { DemoCard }                                       from "../../../components/DemoCard";

export default function WalletDemo() {
  const { connect, disconnect, connected, address, connecting, error, network } = useWallet();
  const { fund, loading: funding, error: fundError, hash, funded } = useFriendbot();
"use client"
import { useWallet, shortenAddress } from "use-stellar"
import { DemoCard } from "../../../components/DemoCard"

export default function WalletDemo() {
  const { connect, disconnect, connected, address, connecting, error, network } = useWallet()

  return (
    <DemoCard
      hook="useWallet"
      description="Connect and disconnect a Stellar wallet. Currently supports Freighter — more wallets tracked as GitHub issues."
      code={`const { 
  connect, 
  disconnect, 
  connected, 
  address,
  walletNetwork,
  refreshWalletNetwork,
  isNetworkMismatch
} = useWallet()

// Connect Freighter
await connect("freighter")

// Refresh wallet network state
await refreshWalletNetwork()

// Check for mismatch
if (isNetworkMismatch) {
  console.warn("Network mismatch detected!")
}

// Disconnect
disconnect()`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {connected ? (
          <>
            <Row label="Status" value="Connected ✓" color="#4ade80" />
            <Row label="Address" value={shortenAddress(address ?? "")} />
            <Row 
              label="Provider Network" 
              value={providerNetwork} 
              color="#60a5fa"
            />
            <Row 
              label="Wallet Network" 
              value={walletNetwork ?? "unknown"} 
              color={isNetworkMismatch ? "#f87171" : "#4ade80"}
            />
            {isNetworkMismatch && (
              <Row 
                label="Warning" 
                value="Network mismatch!" 
                color="#f87171" 
              />
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button 
                onClick={refreshWalletNetwork} 
                style={btnStyle("#2563eb")}
              >
                Refresh Network
              </button>
              <button onClick={disconnect} style={btnStyle("#c00")}>
                Disconnect
              </button>
            </div>
            <Row label="Network" value={network ?? ""} />
            <button onClick={disconnect} style={btnStyle("#c00")}>
              Disconnect
            </button>
            <button
              onClick={() => fund()}
              disabled={funding}
              style={btnStyle("#059669")}
            >
              {funding ? "Funding..." : "Fund testnet account"}
            </button>
            {fundError && <Row label="Friendbot error" value={fundError} color="#f87171" />}
            {hash && <Row label="Funded" value={hash} color="#4ade80" />}
            {funded && !hash && <Row label="Funded" value="Success" color="#4ade80" />}
          </>
        ) : (
          <>
            <Row label="Status" value="Not connected" color="#f87171" />
            <Row 
              label="Provider Network" 
              value={providerNetwork} 
              color="#60a5fa"
            />
            {error && <Row label="Error" value={error} color="#f87171" />}
            {error && <Row label="Error" value={error.message} color="#f87171" />}
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
