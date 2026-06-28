"use client"

import { useEffect, useState } from "react"
import type { CSSProperties } from "react"
import { formatAssetCode, shortenAddress, useAccount, useWallet } from "use-stellar"
import { DemoCard } from "../../../components/DemoCard"

type AccountBalance = NonNullable<ReturnType<typeof useAccount>["account"]>["balances"][number]

export default function AccountDemo() {
  const { address } = useWallet()
  const [input, setInput] = useState("")
  const inspectedAddress = input.trim() || address
  const { account, loading, error, refetch } = useAccount({ address: inspectedAddress })

  useEffect(() => {
    if (address && !input) setInput(address)
  }, [address, input])

  return (
    <DemoCard
      hook="useAccount"
      description="Inspect a Stellar testnet account by address, including balances, thresholds, and signers."
      code={`const { account, loading, error, refetch } = useAccount({
  address: "G...",
})`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={labelStyle}>Account address</label>
        <input
          value={input}
          onChange={event => setInput(event.target.value)}
          placeholder="Paste a G... address"
          style={inputStyle}
        />
        <button
          onClick={refetch}
          disabled={!inspectedAddress || loading}
          style={buttonStyle(!inspectedAddress || loading)}
        >
          {loading ? "Loading..." : "Fetch account"}
        </button>

        {!inspectedAddress && (
          <Text color="#facc15">Connect a wallet or paste any testnet G... address.</Text>
        )}
        {error && <Text color="#f87171">{error}</Text>}

        {account && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <section style={sectionStyle}>
              <Row label="Address" value={shortenAddress(account.address)} />
              <Row label="Sequence" value={account.sequence} />
              <Row label="Subentries" value={String(account.subentryCount)} />
            </section>

            <section style={sectionStyle}>
              <Heading>Thresholds</Heading>
              <Row label="Low" value={String(account.thresholds.lowThreshold)} />
              <Row label="Medium" value={String(account.thresholds.medThreshold)} />
              <Row label="High" value={String(account.thresholds.highThreshold)} />
            </section>

            <section style={sectionStyle}>
              <Heading>Balances</Heading>
              {account.balances.length > 0 ? (
                account.balances.map(balance => (
                  <BalanceRow key={balanceKey(balance)} balance={balance} />
                ))
              ) : (
                <Text color="#666">No balances found.</Text>
              )}
            </section>

            <section style={sectionStyle}>
              <Heading>Signers</Heading>
              {account.signers.length > 0 ? (
                account.signers.map(signer => (
                  <div
                    key={`${signer.key}:${signer.type}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto auto",
                      gap: 10,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: "#e0e0e0", fontFamily: "monospace" }}>
                      {shortenAddress(signer.key)}
                    </span>
                    <span style={{ color: "#666" }}>{signer.type}</span>
                    <span style={{ color: "#4ade80", fontFamily: "monospace" }}>
                      {signer.weight}
                    </span>
                  </div>
                ))
              ) : (
                <Text color="#666">No signers found.</Text>
              )}
            </section>
          </div>
        )}
      </div>
    </DemoCard>
  )
}

function BalanceRow({ balance }: { balance: AccountBalance }) {
  const assetLabel = formatAssetCode(balance.asset)
  const issuer = typeof balance.asset === "object" ? shortenAddress(balance.asset.issuer) : "native"

  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
      <span style={{ color: "#e0e0e0", fontFamily: "monospace" }}>
        {assetLabel} <span style={{ color: "#666" }}>{issuer}</span>
      </span>
      <span style={{ color: "#7dd3fc", fontFamily: "monospace", textAlign: "right" }}>
        {balance.balance}
      </span>
    </div>
  )
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

function Heading({ children }: { children: string }) {
  return (
    <p style={{ margin: "0 0 4px", color: "#7dd3fc", fontFamily: "monospace", fontSize: 13 }}>
      {children}
    </p>
  )
}

function Text({ children, color = "#e0e0e0" }: { children: string; color?: string }) {
  return <p style={{ margin: 0, color, fontSize: 13 }}>{children}</p>
}

function balanceKey(balance: AccountBalance) {
  if (balance.asset === "XLM") return "XLM"
  return `${balance.asset.code}:${balance.asset.issuer}`
}

const labelStyle: CSSProperties = { color: "#666", fontSize: 13 }

const sectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
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
