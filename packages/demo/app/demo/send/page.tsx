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

  // Focus and hover states for rich styling
  const [isBtnHovered, setIsBtnHovered] = useState(false)
  const [isConnBtnHovered, setIsConnBtnHovered] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)

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
      description="Build, sign with Freighter, and submit XLM or USDC payments on the Stellar network."
      code={`const { send, loading, error, result, reset } = useSendPayment()

// Trigger the payment flow
const txResult = await send({
  to: "${destination.substring(0, 8)}...",
  asset: ${assetCode === "XLM" ? '"XLM"' : `{ code: "USDC", issuer: "${TESTNET_USDC_ISSUER.substring(0, 8)}..." }`},
  amount: "${amount}",
  memo: ${memo ? `"${memo}"` : "undefined"}
})`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Wallet Connection Status */}
        <div style={walletBannerStyle(wallet.connected)}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={dotStyle(wallet.connected)} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              {wallet.connected
                ? `Connected: ${shortenAddress(wallet.address || "")}`
                : "Wallet Disconnected"}
            </span>
          </div>
          {!wallet.connected && (
            <button
              onClick={() => wallet.connect("freighter")}
              disabled={wallet.connecting}
              onMouseEnter={() => setIsConnBtnHovered(true)}
              onMouseLeave={() => setIsConnBtnHovered(false)}
              style={connectButtonStyle(wallet.connecting, isConnBtnHovered)}
            >
              {wallet.connecting ? "Connecting..." : "Connect Freighter"}
            </button>
          )}
        </div>

        {/* Form Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Destination Address">
            <input
              value={destination}
              onChange={event => setDestination(event.target.value)}
              onFocus={() => setFocusedInput("destination")}
              onBlur={() => setFocusedInput(null)}
              placeholder="G..."
              style={inputStyle(focusedInput === "destination")}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Asset">
              <select
                value={assetCode}
                onChange={event => setAssetCode(event.target.value as "XLM" | "USDC")}
                onFocus={() => setFocusedInput("asset")}
                onBlur={() => setFocusedInput(null)}
                style={selectStyle(focusedInput === "asset")}
              >
                <option value="XLM">XLM (Native)</option>
                <option value="USDC">USDC (Testnet)</option>
              </select>
            </Field>

            <Field label="Amount">
              <input
                type="number"
                step="0.0000001"
                min="0"
                value={amount}
                onChange={event => setAmount(event.target.value)}
                onFocus={() => setFocusedInput("amount")}
                onBlur={() => setFocusedInput(null)}
                placeholder="1.0"
                style={inputStyle(focusedInput === "amount")}
              />
            </Field>
          </div>

          <Field label="Memo (Optional)">
            <input
              value={memo}
              onChange={event => setMemo(event.target.value)}
              onFocus={() => setFocusedInput("memo")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Text memo"
              style={inputStyle(focusedInput === "memo")}
            />
          </Field>

          {/* Action Button */}
          <button
            onClick={handleSend}
            disabled={disabled}
            onMouseEnter={() => setIsBtnHovered(true)}
            onMouseLeave={() => setIsBtnHovered(false)}
            style={actionButtonStyle(disabled, loading, isBtnHovered)}
          >
            {loading ? "Waiting for signature..." : "Send Payment"}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div style={errorBannerStyle}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Error: {error.message}</span>
            {error.code === "WALLET_NOT_INSTALLED" && (
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={installLinkStyle}
              >
                Install Freighter Extension →
              </a>
            )}
          </div>
        )}

        {/* Transaction Result Display */}
        {result && (
          <div style={resultBannerStyle(result.status)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Payment Result</span>
              <StatusBadge status={result.status} />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
              {result.hash && (
                <>
                  <Row label="Transaction Hash" value={shortenAddress(result.hash)} />
                  <a
                    href={`https://stellar.expert/explorer/${wallet.network || "testnet"}/tx/${result.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={stellarExpertLinkStyle}
                  >
                    View on Stellar Expert ↗
                  </a>
                </>
              )}
              {result.status === "failed" && (
                <span style={{ color: "#f87171", fontSize: 12 }}>
                  The transaction was rejected or failed. Check Freighter network settings.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </DemoCard>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ color: "#aaa", fontSize: 12, fontWeight: 500, letterSpacing: "0.02em" }}>{label}</span>
      {children}
    </label>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
      <span style={{ color: "#888" }}>{label}</span>
      <span style={{ color: "#e0e0e0", fontFamily: "monospace", fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isSuccess = status === "success"
  const isFailed = status === "failed"
  const color = isSuccess ? "#4ade80" : isFailed ? "#f87171" : "#facc15"
  const bg = isSuccess ? "rgba(74, 222, 128, 0.15)" : isFailed ? "rgba(248, 113, 113, 0.15)" : "rgba(250, 204, 21, 0.15)"
  
  return (
    <span
      style={{
        color,
        background: bg,
        padding: "3px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        border: `1px solid ${color}40`,
      }}
    >
      {status}
    </span>
  )
}

function Text({ children, color = "#e0e0e0" }: { children: string; color?: string }) {
  return <p style={{ margin: 0, color, fontSize: 13 }}>{children}</p>
}

// Styling Constants
const inputStyle = (isFocused: boolean): CSSProperties => ({
  background: "#18181b",
  border: isFocused ? "1px solid #7dd3fc" : "1px solid #27272a",
  borderRadius: 8,
  color: "#f4f4f5",
  padding: "10px 12px",
  fontSize: 13,
  fontFamily: "monospace",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxShadow: isFocused ? "0 0 0 2px rgba(125, 211, 252, 0.2)" : "none",
})

const selectStyle = (isFocused: boolean): CSSProperties => ({
  background: "#18181b",
  border: isFocused ? "1px solid #7dd3fc" : "1px solid #27272a",
  borderRadius: 8,
  color: "#f4f4f5",
  padding: "10px 12px",
  fontSize: 13,
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxShadow: isFocused ? "0 0 0 2px rgba(125, 211, 252, 0.2)" : "none",
})

function connectButtonStyle(connecting: boolean, hovered: boolean): CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    cursor: connecting ? "default" : "pointer",
    fontWeight: 600,
    fontSize: 12,
    background: hovered ? "#38bdf8" : "#7dd3fc",
    color: "#09090b",
    transition: "background 0.2s ease",
    opacity: connecting ? 0.7 : 1,
  }
}

function actionButtonStyle(disabled: boolean, loading: boolean, hovered: boolean): CSSProperties {
  const bg = disabled ? "#27272a" : hovered ? "#38bdf8" : "#7dd3fc"
  return {
    padding: "12px 20px",
    borderRadius: 8,
    border: "none",
    cursor: disabled ? "default" : "pointer",
    fontWeight: 600,
    fontSize: 14,
    background: bg,
    color: disabled ? "#71717a" : "#09090b",
    marginTop: 8,
    transition: "all 0.2s ease",
    transform: hovered && !disabled ? "translateY(-1px)" : "none",
    boxShadow: hovered && !disabled ? "0 4px 12px rgba(125, 211, 252, 0.25)" : "none",
  }
}

const walletBannerStyle = (connected: boolean): CSSProperties => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: connected ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
  border: connected ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
  padding: "10px 14px",
  borderRadius: 8,
  color: connected ? "#a7f3d0" : "#fca5a5",
})

const dotStyle = (connected: boolean): CSSProperties => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: connected ? "#10b981" : "#ef4444",
  boxShadow: connected ? "0 0 8px #10b981" : "0 0 8px #ef4444",
})

const errorBannerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  background: "rgba(239, 68, 68, 0.1)",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  padding: "12px 14px",
  borderRadius: 8,
  color: "#fca5a5",
}

const installLinkStyle: CSSProperties = {
  color: "#38bdf8",
  textDecoration: "none",
  fontSize: 12,
  fontWeight: 600,
}

const resultBannerStyle = (status: string): CSSProperties => {
  const isSuccess = status === "success"
  const color = isSuccess ? "#10b981" : "#ef4444"
  return {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    background: isSuccess ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
    border: `1px solid ${color}33`,
    padding: "12px 14px",
    borderRadius: 8,
  }
}

const stellarExpertLinkStyle: CSSProperties = {
  color: "#7dd3fc",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 500,
  marginTop: 4,
  fontFamily: "monospace",
}

