"use client"
import { StellarProvider } from "use-stellar"

export function Providers({ children }: { children: React.ReactNode }) {
  return <StellarProvider network="testnet">{children}</StellarProvider>
}
