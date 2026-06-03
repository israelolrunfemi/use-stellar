"use client";
import { useState } from "react";
import { useAccount, useWallet, formatAssetCode } from "use-stellar";
import { DemoCard } from "../../../components/DemoCard";

export default function AccountDemo() {
  const { address } = useWallet();
  const [custom, setCustom] = useState("");
  const resolved = custom || address;
  const { account, loading, error } = useAccount({ address: resolved });

  return (
    <DemoCard
      hook="useAccount"
      description="Fetch full Stellar account details including sequence, balances, thresholds, and signers."
      code={`const { account, loading, error } = useAccount({
  address: "G...", // or omit to use connected wallet
})`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input
          placeholder="Paste a G... address (or connect wallet)"
          value={custom}
          onChange={setCustom}
        />
        {loading && <Text value="Loading..." />}
        {error && <Text value={error} color="#f87171" />}
        {account ? (
          <>
            <Row label="Address" value={account.address} small />
            <Row label="Sequence" value={account.sequence} />
            <Row label="Subentries" value={String(account.subentryCount)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {account.balances.map(balance => (
                <Row
                  key={`${formatAssetCode(balance.asset)}:${typeof balance.asset === "object" ? balance.asset.issuer : "native"}`}
                  label={formatAssetCode(balance.asset)}
                  value={balance.balance}
                />
              ))}
            </div>
          </>
        ) : (
          !loading && <Text value="Connect a wallet or enter an address." color="#888" />
        )}
      </div>
    </DemoCard>
  );
}

function Input({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (value: string) => void }) {
  return (
    <input
      style={inputStyle}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}

function Row({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: small ? 11 : 13 }}>
      <span style={{ color: "#666", flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#e0e0e0", fontFamily: "monospace", textAlign: "right", wordBreak: "break-all" }}>{value}</span>
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
