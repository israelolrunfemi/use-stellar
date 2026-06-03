"use client";
import { useState } from "react";
import { useTransaction } from "use-stellar";
import { DemoCard } from "../../../components/DemoCard";

export default function TransactionDemo() {
  const [hash, setHash] = useState("");
  const { transaction, loading, error } = useTransaction({ hash: hash || null, watch: true });

  return (
    <DemoCard
      hook="useTransaction"
      description="Fetch a Horizon transaction by hash and poll until it reaches a final status."
      code={`const { transaction, loading } = useTransaction({
  hash: "abc...",
  watch: true,
})`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input style={inputStyle} placeholder="Transaction hash" value={hash} onChange={e => setHash(e.target.value)} />
        {loading && <Text value="Loading..." />}
        {error && <Text value={error} color="#f87171" />}
        {transaction ? (
          <>
            <Row label="Status" value={transaction.status} />
            <Row label="Ledger" value={String(transaction.ledger ?? "-")} />
            <Row label="Fee" value={transaction.fee ?? "-"} />
            <Row label="Created" value={transaction.createdAt ?? "-"} />
          </>
        ) : (
          <Text value="Enter a transaction hash." color="#888" />
        )}
      </div>
    </DemoCard>
  );
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
