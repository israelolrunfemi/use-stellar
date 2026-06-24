import Link from "next/link"

interface Props {
  hook: string
  description: string
  code: string
  children: React.ReactNode
}

export function DemoCard({ hook, description, code, children }: Props) {
  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
      <Link href="/" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>
        ← All hooks
      </Link>

      <h1
        style={{
          fontFamily: "monospace",
          fontSize: 28,
          fontWeight: 700,
          color: "#7dd3fc",
          margin: "20px 0 8px",
        }}
      >
        {hook}
      </h1>

      <p style={{ fontSize: 15, color: "#888", margin: "0 0 32px", lineHeight: 1.6 }}>
        {description}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Code */}
        <div>
          <p
            style={{
              fontSize: 12,
              color: "#555",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Usage
          </p>
          <pre
            style={{
              background: "#1a1a1a",
              borderRadius: 10,
              padding: "16px 18px",
              fontSize: 13,
              lineHeight: 1.7,
              overflowX: "auto",
              color: "#e0e0e0",
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {code}
          </pre>
        </div>

        {/* Live output */}
        <div>
          <p
            style={{
              fontSize: 12,
              color: "#555",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Live output
          </p>
          <div
            style={{
              background: "#1a1a1a",
              borderRadius: 10,
              padding: "16px 18px",
              minHeight: 120,
            }}
          >
            {children}
          </div>
        </div>
      </div>
      <p
        style={{
          fontSize: "0.875rem",
          color: "#71717a",
          marginTop: 24,
          lineHeight: 1.6,
        }}
      >
        <strong>N.B:</strong> Testnet is a sandbox network for building and testing applications
        with free, non-real assets, while Mainnet is the live production network where transactions
        use real assets and have real-world consequences.
      </p>
    </main>
  )
}
