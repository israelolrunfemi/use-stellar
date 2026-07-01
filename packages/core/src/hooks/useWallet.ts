import { useCallback, useMemo } from "react"
import { useStellarContext } from "../context/StellarProvider"
import { isBrowser } from "../utils"
import type { WalletState, WalletType, StellarNetwork } from "../types"
import { createStellarError, toStellarError } from "../errors"
import { getWalletAdapter } from "../wallets"

export interface UseWalletReturn extends WalletState {
  connect: (wallet?: WalletType) => Promise<void>
  disconnect: () => void
  refreshWalletNetwork: () => Promise<void>
  isNetworkMismatch: boolean
}

/**
 * Manages wallet connection state and provides functions to connect and disconnect.
 *
 * @returns `{ connected, address, network, wallet, walletName, connecting, error, connect, disconnect }`
 *
 * @example
 * const { address, connect, disconnect } = useWallet()
 * await connect("freighter")
 */
export function useWallet(): UseWalletReturn {
  const { wallet, setWallet, network } = useStellarContext()

  const connect = useCallback(
    async (walletType: WalletType = "freighter") => {
      if (!isBrowser()) {
        setWallet(prev => ({
          ...prev,
          error: createStellarError(
            "VALIDATION_ERROR",
            "Wallet connection is only available in the browser. " +
              'Move your component to a "use client" boundary in Next.js / Remix.'
          ),
        }))
        return
      }

      setWallet(prev => ({ ...prev, connecting: true, error: null }))

      try {
        const adapter = getWalletAdapter(walletType)
        const connection = await adapter.connect(network)

        setWallet({
          connected: true,
          address: connection.address,
          network: connection.network,
          wallet: connection.wallet,
          walletName: adapter.metadata.name,
          connecting: false,
          error: null,
          walletNetwork: connection.network,
        })
      } catch (err) {
        setWallet(prev => ({
          ...prev,
          connecting: false,
          error: toStellarError(err),
        }))
      }
    },
    [setWallet, network]
  )

  const disconnect = useCallback(() => {
    if (wallet.wallet) {
      void getWalletAdapter(wallet.wallet).disconnect?.()
    }

    setWallet({
      connected: false,
      address: null,
      network: null,
      wallet: null,
      walletName: null,
      connecting: false,
      error: null,
      walletNetwork: null,
    })
  }, [setWallet, wallet.wallet])

  const refreshWalletNetwork = useCallback(async () => {
    if (!wallet.connected || wallet.wallet !== "freighter") {
      return
    }

    try {
      const walletNetwork = await getFreighterNetwork()
      setWallet(prev => ({
        ...prev,
        walletNetwork,
        error: null,
      }))
    } catch (err) {
      setWallet(prev => ({
        ...prev,
        error: toStellarError(err),
      }))
    }
  }, [wallet.connected, wallet.wallet, setWallet])

  const isNetworkMismatch = useMemo(() => {
    if (!wallet.connected || !wallet.walletNetwork) return false
    return wallet.network !== wallet.walletNetwork
  }, [wallet.connected, wallet.network, wallet.walletNetwork])

  return {
    ...wallet,
    connect,
    disconnect,
    refreshWalletNetwork,
    isNetworkMismatch,
  }
}

// ── Get Freighter network (used for post-connect drift checks) ─────────────
async function getFreighterNetwork(): Promise<StellarNetwork> {
  // Dynamic import keeps @stellar/freighter-api out of the SSR bundle.
  const freighter = await import("@stellar/freighter-api")
  const getNetworkDetails = freighter.getNetworkDetails

  const networkDetails = await getNetworkDetails()

  if (networkDetails.error) {
    throw new Error(networkDetails.error)
  }

  if (networkDetails.networkPassphrase === "Public Global Stellar Network ; September 2015") {
    return "mainnet"
  }

  if (networkDetails.networkPassphrase === "Test SDF Network ; September 2015") {
    return "testnet"
  }

  throw new Error("Unknown Stellar network")
}
