"use client"

import { useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import { shortenAddress, useAsset } from "use-stellar"
import { DemoCard } from "../../../components/DemoCard"

const DEFAULT_CODE = "USDC"
const DEFAULT_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"

export default function AssetDemo() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [issuer, setIssuer] = useState(DEFAULT_ISSUER)
  const [query, setQuery] = useState({ code: DEFAULT_CODE, issuer: DEFAULT_ISSUER })
  const { asset, loading, error, refetch } = useAsset(query)

  function handleFetch() {
    setQuery({ code: code.trim(), issuer: issuer.trim() })
    refetch()
  }

  return (
    <DemoCard
      hook="useAsset"
      description="Fetch issued asset metadata from Horizon on the Stellar testnet."
      code={`const { asset, loading, error, refetch } = useAsset({
  code: "USDC",
  issuer: "G...",
})`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Asset code">
          <input value={code} onChange={event => setCode(event.target.value)} style={inputStyle} />
        </Field>
        <Field label="Issuer">
          <input
            value={issuer}
            onChange={event => setIssuer(event.target.value)}
            style={inputStyle}
          />
        </Field>
        <button
          onClick={handleFetch}
          disabled={loading || !code.trim() || !issuer.trim()}
          style={buttonStyle(loading || !code.trim() || !issuer.trim())}
        >
          {loading ? "Loading..." : "Fetch asset"}
        </button>

        {error && <Text color="#f87171">{error.message}</Text>}
        {asset && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Row label="Code" value={asset.code} />
            <Row label="Issuer" value={shortenAddress(asset.issuer)} />
            <Row label="Home domain" value={asset.homeDomain ?? "-"} />
            <Row label="Total supply" value={asset.supply} />
            <Row label="Accounts" value={String(asset.numAccounts)} />
          </div>
        )}
      </div>
    </DemoCard>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ color: "#666", fontSize: 13 }}>{label}</span>
      {children}
    </label>
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
