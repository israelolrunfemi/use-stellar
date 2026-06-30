"use client";
import { useState } from "react";
import { usePayments, useWallet, shortenAddress, formatAssetCode } from "use-stellar";
import { DemoCard } from "../../../components/DemoCard";

export default function PaymentsDemo() {
  const { address } = useWallet();
  const [custom, setCustom] = useState("");
  const resolved = custom || address;

  const {
    payments,
    loading,
    error,
    fetchNext,
    fetchPrev,
    hasNext,
    hasPrev,
  } = usePayments({
    address: resolved,
    limit: 5,
  });

  return (
    <DemoCard
      hook="usePayments"
      description="Retrieve a normalized, paginated history of incoming and outgoing payments for an address. Identifies directions relative to the target address, supports custom addresses, and handles XLM, issued assets, account creations, and account merges."
      code={`const {
  payments,
  loading,
  error,
  fetchNext,
  fetchPrev,
  hasNext,
  hasPrev
} = usePayments({
  address: "${resolved || 'G...'}",
  limit: 5,
})`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input
          style={{
            background: "#111",
            border: "1px solid #333",
            borderRadius: 6,
            padding: "8px 10px",
            color: "#e0e0e0",
            fontSize: 12,
            fontFamily: "monospace",
            width: "100%",
            boxSizing: "border-box",
          }}
          placeholder="Paste a G... address (or connect wallet)"
          value={custom}
          onChange={e => setCustom(e.target.value)}
        />

        {loading && (
          <div style={{ color: "#888", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
            Loading payments...
          </div>
        )}

        {!loading && !resolved && (
          <div style={{ color: "#666", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
            Connect your wallet or enter an address above to see payments.
          </div>
        )}

        {!loading && resolved && payments.length === 0 && (
          <div style={{ color: "#666", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
            No payments found for this account.
          </div>
        )}

        {error && (
          <div style={{ color: "#f87171", fontSize: 12, padding: "10px", background: "#221111", borderRadius: 6 }}>
            Error: {error}
          </div>
        )}

        {!loading && payments.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {payments.map(payment => {
              const isIncoming = payment.direction === "incoming";
              const assetCode = formatAssetCode(payment.asset);
              
              return (
                <div
                  key={payment.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#161616",
                    border: "1px solid #222",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 13,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: isIncoming ? "#166534" : "#991b1b",
                          color: isIncoming ? "#bbf7d0" : "#fecaca",
                          textTransform: "uppercase",
                        }}
                      >
                        {isIncoming ? "In" : "Out"}
                      </span>
                      <span style={{ fontWeight: 600, color: "#fff" }}>
                        {payment.amount} {assetCode}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                      {isIncoming ? `From: ${shortenAddress(payment.from, 4)}` : `To: ${shortenAddress(payment.to, 4)}`}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${payment.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 11,
                        color: "#38bdf8",
                        textDecoration: "none",
                        fontFamily: "monospace",
                      }}
                    >
                      {shortenAddress(payment.txHash, 3)}
                    </a>
                    <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>
                      {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            <div style={{ display: "flex", justifySelf: "center", justifyContent: "space-between", marginTop: 12 }}>
              <button
                onClick={fetchPrev}
                disabled={!hasPrev}
                style={{
                  background: hasPrev ? "#222" : "#111",
                  border: "1px solid #333",
                  borderRadius: 6,
                  color: hasPrev ? "#fff" : "#444",
                  padding: "6px 12px",
                  fontSize: 12,
                  cursor: hasPrev ? "pointer" : "default",
                }}
              >
                ← Prev
              </button>
              <button
                onClick={fetchNext}
                disabled={!hasNext}
                style={{
                  background: hasNext ? "#222" : "#111",
                  border: "1px solid #333",
                  borderRadius: 6,
                  color: hasNext ? "#fff" : "#444",
                  padding: "6px 12px",
                  fontSize: 12,
                  cursor: hasNext ? "pointer" : "default",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </DemoCard>
  );
}
