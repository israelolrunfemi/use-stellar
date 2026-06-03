"use client";
import { useState } from "react";
import { useSendPayment, useWallet } from "use-stellar";
import { DemoCard } from "../../../components/DemoCard";

const TESTNET_USDC_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

export default function SendDemo() {
  const wallet = useWallet();
  const { send, loading, error, result } = useSendPayment();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<"XLM" | "USDC">("XLM");
  const [memo, setMemo] = useState("");

  async function onSend() {
    await send({
      to,
      amount,
      memo: memo || undefined,
      asset: asset === "XLM" ? "XLM" : { code: "USDC", issuer: TESTNET_USDC_ISSUER },
    }).catch(() => undefined);
  }

  return (
    <DemoCard
      hook="useSendPayment"
      description="Build, sign with Freighter, and submit an XLM or issued-asset payment."
      code={`const { send, loading, result } = useSendPayment()

await send({
  to: "G...",
  amount: "10",
  asset: "XLM",
  memo: "optional",
})`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Input placeholder="Destination G... address" value={to} onChange={setTo} />
        <Input placeholder="Amount" value={amount} onChange={setAmount} />
        <select value={asset} onChange={e => setAsset(e.target.value as "XLM" | "USDC")} style={inputStyle}>
          <option value="XLM">XLM</option>
          <option value="USDC">USDC</option>
        </select>
        <Input placeholder="Memo (optional)" value={memo} onChange={setMemo} />
        {!wallet.connected && <Text value="Connect wallet first" color="#fbbf24" />}
        <button disabled={!wallet.connected || loading} onClick={onSend} style={btnStyle(!wallet.connected || loading)}>
          {loading ? "Sending..." : "Send"}
        </button>
        {result && <Row label="Hash" value={result.hash} />}
        {error && <Text value={error} color="#f87171" />}
      </div>
    </DemoCard>
  );
}

function Input({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (value: string) => void }) {
  return <input style={inputStyle} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
      <span style={{ color: "#666", flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#7dd3fc", fontFamily: "monospace", textAlign: "right", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

function Text({ value, color = "#e0e0e0" }: { value: string; color?: string }) {
  return <p style={{ margin: 0, color, fontSize: 13 }}>{value}</p>;
}

const inputStyle: React.CSSProperties = {
  background: "#111",
  border: "1px solid #333",
  borderRadius: 6,
  padding: "8px 10px",
  color: "#e0e0e0",
  fontSize: 12,
  fontFamily: "monospace",
};

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: "10px 20px",
    background: disabled ? "#333" : "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 14,
    fontWeight: 500,
  };
}
