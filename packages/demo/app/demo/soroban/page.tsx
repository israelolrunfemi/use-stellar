"use client"

import { useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import { useSorobanContract, useWallet } from "use-stellar"
import { DemoCard } from "../../../components/DemoCard"

export default function SorobanDemo() {
  const wallet = useWallet()
  const [contractId, setContractId] = useState("")
  const [method, setMethod] = useState("")
  const [query, setQuery] = useState({ contractId: "", method: "" })
  const { data, loading, error, refetch } = useSorobanContract(query)
  const disabled = !wallet.connected || loading || !contractId.trim() || !method.trim()

  function handleCall() {
    setQuery({ contractId: contractId.trim(), method: method.trim() })
    refetch()
  }

  return (
    <DemoCard
      hook="useSorobanContract"
      description="Simulate a read-only Soroban contract method via the Soroban RPC. Results are decoded to native JS values where possible."
      code={`const { data, loading, error, refetch } = useSorobanContract({
  contractId: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  method: "balance",
  args: ["GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOACCWN"],
})`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Text color="#facc15">
          This hook is in active development. Write calls requiring signing are tracked in GitHub
          issue #8.
        </Text>

        {!wallet.connected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Text color="#facc15">Connect Freighter on testnet to simulate a Soroban call.</Text>
            <button
              onClick={() => wallet.connect("freighter")}
              disabled={wallet.connecting}
              style={buttonStyle(wallet.connecting)}
            >
              {wallet.connecting ? "Connecting..." : "Connect wallet"}
            </button>
          </div>
        )}

        <Field label="Contract ID">
          <input
            value={contractId}
            onChange={event => setContractId(event.target.value)}
            placeholder="C..."
            style={inputStyle}
          />
        </Field>

        <Field label="Method">
          <input
            value={method}
            onChange={event => setMethod(event.target.value)}
            placeholder="balance"
            style={inputStyle}
          />
        </Field>

        <button onClick={handleCall} disabled={disabled} style={buttonStyle(disabled)}>
          {loading ? "Calling..." : "Call contract"}
        </button>

        {error && <Text color="#f87171">{error.message}</Text>}
        {data !== null && (
          <pre
            style={{
              margin: 0,
              color: "#e0e0e0",
              fontSize: 13,
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
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
