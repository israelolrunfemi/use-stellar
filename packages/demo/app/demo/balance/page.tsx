"use client";
import { useState }                    from "react";
import { useBalance, useWallet }       from "use-stellar";
import { DemoCard }                    from "../../../components/DemoCard";

export default function BalanceDemo() {
  const { address }           = useWallet();
  const [custom, setCustom]   = useState("");
  const resolved              = custom || address;

  const xlm  = useBalance({ address: resolved, asset: "XLM",  watch: true });
  const usdc = useBalance({
    address: resolved,
    asset: { code: "USDC", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" },
  });

  return (
    <DemoCard
      hook="useBalance"
      description="Fetch the balance of XLM or any Stellar asset for an address. Pass watch: true to auto-refresh every 10s."
      code={`const { balance, loading } = useBalance({
  address: "G...",   // or omit to use connected wallet
  asset:   "XLM",
  watch:   true,     // refresh every 10s
})`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          style={{
            background: "#111", border: "1px solid #333",
            borderRadius: 6, padding: "8px 10px",
            color: "#e0e0e0", fontSize: 12, fontFamily: "monospace",
          }}
          placeholder="Paste a G... address (or connect wallet)"
          value={custom}
          onChange={e => setCustom(e.target.value)}
        />
        
        {/* Native Balance */}
        <div style={{ marginBottom: 8 }}>
          <h4 style={{ color: "#888", fontSize: 12, marginBottom: 4, textTransform: "uppercase" }}>
            Native Balance
          </h4>
          <Row label="XLM" value={xlm.loading ? "..." : (xlm.balance ?? "—")} />
        </div>

        {/* Issued Assets */}
        <div style={{ marginBottom: 8 }}>
          <h4 style={{ color: "#888", fontSize: 12, marginBottom: 4, textTransform: "uppercase" }}>
            Issued Assets
          </h4>
          <Row label="USDC" value={usdc.loading ? "..." : (usdc.balance ?? "—")} />
        </div>

        {/* Liquidity Pool Shares */}
        <div style={{ marginBottom: 8 }}>
          <h4 style={{ color: "#888", fontSize: 12, marginBottom: 4, textTransform: "uppercase" }}>
            Liquidity Pool Shares
          </h4>
          {xlm.balances
            .filter(b => b.asset === "liquidity_pool_shares")
            .map((balance) => (
              <div key={balance.liquidityPoolId} style={{ marginBottom: 4 }}>
                <Row 
                  label={`LP ${balance.liquidityPoolId.slice(0, 8)}...`} 
                  value={balance.balance} 
                />
                <div style={{ fontSize: 10, color: "#555", marginLeft: 16 }}>
                  Pool ID: {balance.liquidityPoolId}
                </div>
              </div>
            ))
          }
          {xlm.balances.filter(b => b.asset === "liquidity_pool_shares").length === 0 && (
            <div style={{ color: "#666", fontSize: 12, fontStyle: "italic" }}>
              No liquidity pool shares
            </div>
          )}
        </div>

        {xlm.error && <p style={{ color: "#f87171", fontSize: 12 }}>{xlm.error}</p>}
      </div>
    </DemoCard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "#666" }}>{label}</span>
      <span style={{ color: "#e0e0e0", fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}
