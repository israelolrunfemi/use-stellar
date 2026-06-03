"use client";
import { useState } from "react";
import { useAsset } from "use-stellar";
import { DemoCard } from "../../../components/DemoCard";

const DEFAULT_CODE = "USDC";
const DEFAULT_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

export default function AssetDemo() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [issuer, setIssuer] = useState(DEFAULT_ISSUER);
  const [query, setQuery] = useState({ code: DEFAULT_CODE, issuer: DEFAULT_ISSUER });
  const { asset, loading, error } = useAsset(query);

  return (
    <DemoCard
      hook="useAsset"
      description="Fetch issued-asset metadata from Horizon, including supply, account count, home domain, and authorization flags."
      code={`const { asset, loading, error } = useAsset({
  code: "USDC",
  issuer: "G...",
})`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Input placeholder="Asset code" value={code} onChange={setCode} />
        <Input placeholder="Issuer G... address" value={issuer} onChange={setIssuer} />
        <button onClick={() => setQuery({ code, issuer })} style={btnStyle}>Fetch</button>
        {loading && <Text value="Loading..." />}
        {error && <Text value={error} color="#f87171" />}
        {asset && (
          <>
            <Row label="Supply" value={asset.supply} />
            <Row label="Accounts" value={String(asset.numAccounts)} />
            <Row label="Home domain" value={asset.homeDomain ?? "-"} />
            <Row label="Auth required" value={String(asset.flags.authRequired)} />
            <Row label="Auth revocable" value={String(asset.flags.authRevocable)} />
            <Row label="Auth immutable" value={String(asset.flags.authImmutable)} />
          </>
        )}
      </div>
    </DemoCard>
  );
}

function Input({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (value: string) => void }) {
  return <input style={inputStyle} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
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

const btnStyle: React.CSSProperties = {
  padding: "10px 20px",
  background: "#1d4ed8",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
};
