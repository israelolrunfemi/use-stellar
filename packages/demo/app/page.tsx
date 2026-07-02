import type { CSSProperties } from "react";
import Link from "next/link";
import { CodeBlock } from "./components/CodeBlock";
import { HookCard } from "./components/HookCard";
import { TopNav } from "./components/TopNav";
import { CopyButton } from "./components/CopyButton";

const hooks = [
  ["useWallet", "Connect Freighter and read wallet state.", "const { connect } = useWallet()", "/docs/hooks/use-wallet"],
  ["useBalance", "Fetch XLM or issued asset balances.", "const { balance } = useBalance()", "/docs/hooks/use-balance"],
  ["useAccount", "Load account details, signers, and thresholds.", "const { account } = useAccount()", "/docs/hooks/use-account"],
  ["useSendPayment", "Build, sign, and submit payments.", "await send({ to, asset, amount })", "/docs/hooks/use-send-payment"],
  ["useTransaction", "Track transaction status by hash.", "useTransaction({ hash, watch: true })", "/docs/hooks/use-transaction"],
  ["useNetwork", "Read the active Stellar network config.", "const { isTestnet } = useNetwork()", "/docs/hooks/use-network"],
  ["useAsset", "Inspect asset supply and issuer metadata.", "useAsset({ code, issuer })", "/docs/hooks/use-asset"],
  ["useSorobanContract", "Prepare Soroban contract reads.", "useSorobanContract({ contractId, method })", "/docs/hooks/use-soroban-contract"],
  ["useClaimableBalance", "Track claimable balances and escrow claims.", "const { balances } = useClaimableBalance()", "/demo/claimable"],
] as const;

const rawSdk = `import { Horizon, Asset } from "@stellar/stellar-sdk"

const server = new Horizon.Server("https://horizon-testnet.stellar.org")
const account = await server.loadAccount(address)
const balances = account.balances.map(balance => ({
  asset: balance.asset_type === "native"
    ? "XLM"
    : { code: balance.asset_code, issuer: balance.asset_issuer },
  balance: balance.balance,
}))

const xlm = balances.find(item => item.asset === "XLM")
console.log(xlm?.balance ?? "0")`;

const withHook = `import { useBalance } from "use-stellar"

const { balance, loading } = useBalance({ asset: "XLM" })`;

export default async function Home() {
  return (
    <main>
      <TopNav />
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "76px 24px 36px" }}>
        <div style={{ maxWidth: 850 }}>
          <p style={{ margin: "0 0 14px", color: "#7dd3fc", fontFamily: "monospace" }}>React hooks for Stellar</p>
          <h1 style={{ margin: 0, fontSize: 68, lineHeight: 1.02, letterSpacing: 0, color: "#f0f0f0" }}>Build Stellar apps with precise React hooks.</h1>
          <p style={{ margin: "22px 0 0", color: "#a8a8a8", fontSize: 20, lineHeight: 1.65, maxWidth: 720 }}>use-stellar gives developers typed wallet, account, balance, payment, transaction, network, asset, and Soroban primitives without rebuilding Horizon and wallet plumbing.</p>
        </div>
        <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative", minWidth: 280, border: "1px solid #2a2a2a", borderRadius: 10, background: "#111111", padding: "14px 54px 14px 16px", fontFamily: "monospace", color: "#f0f0f0" }}>
            pnpm add use-stellar
            <CopyButton text="pnpm add use-stellar" label="Copy" />
          </div>
          <Link href="/docs" style={buttonPrimary}>View Docs</Link>
          <a href="https://github.com/israelolrunfemi/use-stellar" style={buttonSecondary}>GitHub</a>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 24px 70px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
          <div>
            <h2 style={panelTitle}>Before</h2>
            {await CodeBlock({ code: rawSdk, lang: "ts" })}
          </div>
          <div>
            <h2 style={panelTitle}>After</h2>
            {await CodeBlock({ code: withHook, lang: "tsx" })}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 72px" }}>
        <h2 style={sectionTitle}>Hook reference</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))", gap: 14 }}>
          {hooks.map(([name, description, snippet, href]) => <HookCard key={name} name={name} description={description} snippet={snippet} href={href} />)}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 76px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {[
            ["TS", "Fully typed", "TypeScript-first return values, options, and exported Stellar primitives."],
            ["01", "Zero config", "Wrap once with StellarProvider and use hooks anywhere in your tree."],
            ["◎", "Wallet agnostic", "Freighter works today, with Albedo and more tracked by the public roadmap."],
          ].map(([icon, title, body]) => (
            <div key={title} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22 }}>
              <div style={{ color: "#4ade80", fontFamily: "monospace", marginBottom: 12 }}>{icon}</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{title}</h3>
              <p style={{ margin: 0, color: "#a8a8a8", lineHeight: 1.6 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 78px" }}>
        <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 28 }}>
          <h2 style={sectionTitle}>Contributing</h2>
          <p style={{ maxWidth: 720, color: "#a8a8a8", lineHeight: 1.7 }}>use-stellar is early infrastructure for Stellar React apps. Help improve wallet support, Soroban calls, docs, and examples through focused issues and pull requests.</p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href="https://github.com/israelolrunfemi/use-stellar/issues" style={textLink}>GitHub issues</a>
            <a href="https://github.com/israelolrunfemi/use-stellar/blob/main/CONTRIBUTING.md" style={textLink}>CONTRIBUTING.md</a>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #2a2a2a", padding: "22px 24px", color: "#666666" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "space-between" }}>
          <a href="https://www.npmjs.com/package/use-stellar" style={footerLink} aria-label="use-stellar on npm"><img src="https://img.shields.io/npm/v/use-stellar?style=flat-square&color=7dd3fc&label=npm" alt="npm version" style={{ display: "block", height: 20 }} /></a><a href="https://github.com/israelolrunfemi/use-stellar" style={footerLink}>GitHub</a><span>MIT license</span><span>Built on Stellar</span>
        </div>
      </footer>
    </main>
  );
}

const buttonPrimary: CSSProperties = { display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 18px", borderRadius: 8, background: "#f0f0f0", color: "#0f0f0f", textDecoration: "none", fontWeight: 700 };
const buttonSecondary: CSSProperties = { display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 18px", borderRadius: 8, border: "1px solid #2a2a2a", color: "#f0f0f0", textDecoration: "none", fontWeight: 700 };
const sectionTitle: CSSProperties = { margin: "0 0 18px", fontSize: 26, color: "#f0f0f0" };
const panelTitle: CSSProperties = { margin: "0 0 10px", color: "#666666", fontSize: 14, fontFamily: "monospace", fontWeight: 400 };
const textLink: CSSProperties = { color: "#7dd3fc", textDecoration: "none", fontWeight: 700 };
const footerLink: CSSProperties = { color: "#f0f0f0", textDecoration: "none" };