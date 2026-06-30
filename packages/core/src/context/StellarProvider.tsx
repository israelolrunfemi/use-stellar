import * as React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"
import type { StellarContextValue, StellarNetwork, WalletState } from "../types"
import { NETWORK_CONFIGS } from "../types"

const DEFAULT_WALLET: WalletState = {
  connected: false,
  address: null,
  network: null,
  wallet: null,
  walletName: null,
  connecting: false,
  error: null,
}
  connected:     false,
  address:       null,
  network:       null,
  wallet:        null,
  connecting:    false,
  error:         null,
  walletNetwork: null,
};

const StellarContext = createContext<StellarContextValue | null>(null)

export interface StellarProviderProps {
  network?: StellarNetwork
  children: ReactNode
}

export function StellarProvider({ network = "testnet", children }: StellarProviderProps) {
  const [wallet, setWallet] = useState<WalletState>(DEFAULT_WALLET)

  const value: StellarContextValue = {
    network,
    networkConfig: NETWORK_CONFIGS[network],
    wallet,
    setWallet,
  }

  return <StellarContext.Provider value={value}>{children}</StellarContext.Provider>
}

export function useStellarContext(): StellarContextValue {
  const ctx = useContext(StellarContext)
  if (!ctx) {
    throw new Error(
      "use-stellar: No StellarProvider found. " +
        "Wrap your app in <StellarProvider> before using any use-stellar hooks."
    )
  }
  return ctx
}
