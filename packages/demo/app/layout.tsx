import type { Metadata } from "next"
import { Providers } from "../components/Providers"

export const metadata: Metadata = {
  title: "use-stellar demo",
  description: "React hooks for the Stellar network",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#0f0f0f",
          color: "#f0f0f0",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
