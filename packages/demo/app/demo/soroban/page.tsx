"use client";
import { useState } from "react";
import { useSorobanContract } from "use-stellar";
import { DemoCard } from "../../../components/DemoCard";

export default function SorobanDemo() {
  const [contractId, setContractId] = useState("");
  const [method, setMethod] = useState("balance");
  const [query, setQuery] = useState({ contractId: "", method: "balance" });
  const { data, loading, error } = useSorobanContract(query);

  return (
    <DemoCard
      hook="useSorobanContract"
      description="Preview the current Soroban hook stub while full simulation support is being built."
      code={`const { data, loading, error } = useSorobanContract({
  contractId: "C...",
  method: "balance",
})`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ margin: 0, color: "#fbbf24", fontSize: 13 }}>
          Full Soroban simulation is in progress - tracked in issue #10.
        </p>
        <Input placeholder="Contract ID" value={contractId} onChange={setContractId} />
        <Input placeholder="Method" value={method} onChange={setMethod} />
        <button onClick={() => setQuery({ contractId, method })} style={btnStyle}>Call</button>
        {loading && <Text value="Loading..." />}
        {error && <Text value={error} color="#f87171" />}
        {data !== null && (
          <pre style={{ margin: 0, color: "#e0e0e0", fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </DemoCard>
  );
}

function Input({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (value: string) => void }) {
  return <input style={inputStyle} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />;
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
