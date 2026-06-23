"use client"

import { useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import { shortenAddress, useSendPayment, useWallet } from "use-stellar"
import type { Asset } from "use-stellar"
import { DemoCard } from "../../../components/DemoCard"

const DEFAULT_DESTINATION = "GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR"
const TESTNET_USDC_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"

export default function SendDemo() {
  const wallet = useWallet()
  const { send, loading, error, result, reset } = useSendPayment()
  const [destination, setDestination] = useState(DEFAULT_DESTINATION)
  const [amount, setAmount] = useState("1")
  const [assetCode, setAssetCode] = useState<"XLM" | "USDC">("XLM")
  const [memo, setMemo] = useState("")

  const disabled = !wallet.connected || loading || !destination.trim() || !amount.trim()

  async function handleSend() {
    reset()
    const asset: Asset = assetCode === "XLM" ? "XLM" : { code: "USDC", issuer: TESTNET_USDC_ISSUER }

    await send({
      to: destination.trim(),
      amount,
      asset,
      memo: memo.trim() || undefined,
    }).catch(() => undefined)
  }

  return (
    <DemoCard
      hook="useSendPayment"
      description="Send XLM or testnet USDC through Freighter and submit the signed transaction."
      code={`const { send, loading, error, result, reset } = useSendPayment()

reset()
await send({
  to: "G...",
  asset: "XLM",
  amount: "1",
  memo: "optional",
})`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {!wallet.connected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Text color="#facc15">Connect Freighter on testnet before sending a payment.</Text>
            <button
              onClick={() => wallet.connect("freighter")}
              disabled={wallet.connecting}
              style={buttonStyle(wallet.connecting)}
            >
              {wallet.connecting ? "Connecting..." : "Connect wallet"}
            </button>
          </div>
        )}

        <Field label="Destination">
          <input
            value={destination}
            onChange={event => setDestination(event.target.value)}
            placeholder="Destination G... address"
            style={inputStyle}
          />
        </Field>

        <Field label="Asset">
          <select
            value={assetCode}
            onChange={event => setAssetCode(event.target.value as "XLM" | "USDC")}
            style={inputStyle}
          >
            <option value="XLM">XLM</option>
            <option value="USDC">USDC</option>
          </select>
        </Field>

        <Field label="Amount">
          <input
            type="number"
            step="0.0000001"
            min="0"
            value={amount}
            onChange={event => setAmount(event.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label="Memo">
          <input
            value={memo}
            onChange={event => setMemo(event.target.value)}
            placeholder="Optional text memo"
            style={inputStyle}
          />
        </Field>

        <button onClick={handleSend} disabled={disabled} style={buttonStyle(disabled)}>
          {loading ? "Waiting for signature..." : "Send payment"}
        </button>

        {error && <Text color="#f87171">{error}</Text>}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <StatusBadge status={result.status} />
            <Row label="Hash" value={shortenAddress(result.hash)} />
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
      <span style={{ color: "#e0e0e0", fontFamily: "monospace" }}>{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const color = status === "success" ? "#4ade80" : status === "failed" ? "#f87171" : "#facc15"
  return <span style={{ color, fontFamily: "monospace", fontSize: 13 }}>Status: {status}</span>
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
