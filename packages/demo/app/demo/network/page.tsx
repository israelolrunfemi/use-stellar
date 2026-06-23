"use client"
import { useNetwork } from "use-stellar"
import { DemoCard } from "../../../components/DemoCard"

export default function NetworkDemo() {
  const { network, networkConfig, isTestnet, isMainnet } = useNetwork()

  return (
    <DemoCard
      hook="useNetwork"
      description="Read the current network from the StellarProvider and access the full network config including Horizon and Soroban RPC URLs."
      code={`const {
  network,        // "testnet" | "mainnet"
  networkConfig,  // { horizonUrl, sorobanUrl }
  isTestnet,
  isMainnet,
} = useNetwork()`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
        <Row label="network" value={network} />
        <Row label="isTestnet" value={String(isTestnet)} />
        <Row label="isMainnet" value={String(isMainnet)} />
        <Row label="horizonUrl" value={networkConfig.horizonUrl} small />
        <Row label="sorobanUrl" value={networkConfig.sorobanUrl} small />
      </div>
    </DemoCard>
  )
}

function Row({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        fontSize: small ? 11 : 13,
      }}
    >
      <span style={{ color: "#666", flexShrink: 0 }}>{label}</span>
      <span
        style={{
          color: "#7dd3fc",
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
