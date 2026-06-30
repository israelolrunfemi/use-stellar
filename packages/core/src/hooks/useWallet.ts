import { useCallback, useMemo } from "react"
import { useStellarContext } from "../context/StellarProvider"
import { isBrowser } from "../utils"
import type { WalletState, WalletType, StellarNetwork } from "../types"
import { createStellarError, toStellarError } from "../errors"
import type { WalletState, WalletType } from "../types"

export interface UseWalletReturn extends WalletState {
  connect: (wallet?: WalletType) => Promise<void>
  disconnect: () => void
  refreshWalletNetwork: () => Promise<void>
  isNetworkMismatch: boolean
}

/**
 * Manages wallet connection state and provides functions to connect and disconnect.
 *
 * @returns `{ connected, address, network, wallet, connecting, error, connect, disconnect }`
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
        let address: string
        let walletNetwork: StellarNetwork

        if (walletType === "freighter") {
          const result = await connectFreighter(network)
          address = result.address
          walletNetwork = result.walletNetwork
        } else {
          throw createStellarError(
            "VALIDATION_ERROR",
            `Wallet "${walletType}" not yet supported. ` +
              `Contributions welcome — see GitHub issues.`
          )
        }

        setWallet({
          connected: true,
          address,
          network,
          wallet: walletType,
          connecting: false,
          error: null,
          walletNetwork,
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
    setWallet({
      connected: false,
      address: null,
      network: null,
      wallet: null,
      connecting: false,
      error: null,
      walletNetwork: null,
    })
  }, [setWallet])

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
        error: err instanceof Error ? err.message : "Failed to refresh wallet network",
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

// ── Freighter connector ────────────────────────────────────────────────────
async function connectFreighter(
  network: string
): Promise<{ address: string; walletNetwork: StellarNetwork }> {
  // Dynamic import keeps @stellar/freighter-api out of the SSR bundle.
  const freighterApi = await import("@stellar/freighter-api")
  const { isConnected, requestAccess, getNetworkDetails } =
    typeof freighterApi.isConnected === "function"
      ? freighterApi
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (freighterApi as any).default

  const connection = await isConnected()
  if (connection.error || !connection.isConnected) {
    throw createStellarError(
      "WALLET_NOT_INSTALLED",
      "Freighter wallet not found. Install the Freighter browser extension and try again."
    )
  }

  const access = await requestAccess()
  if (access.error) {
    // Let toStellarError classify (e.g. "User declined access" → rejected).
    throw new Error(access.error.message)
  }

  if (!access.address) {
    throw createStellarError(
      "WALLET_REQUEST_REJECTED",
      "Freighter did not return a wallet address."
    )
  }

  const walletNetwork = await getFreighterNetworkInternal(getNetworkDetails)

  // Validate we're on the right network
  const expectedPassphrase =
    network === "mainnet"
      ? "Public Global Stellar Network ; September 2015"
      : "Test SDF Network ; September 2015"

  const actualPassphrase =
    walletNetwork === "mainnet"
      ? "Public Global Stellar Network ; September 2015"
      : "Test SDF Network ; September 2015"

  if (actualPassphrase !== expectedPassphrase) {
    throw new Error(`Wrong network. Switch Freighter to ${network} and try again.`)
  if (networkDetails.networkPassphrase !== expectedPassphrase) {
    throw createStellarError(
      "WRONG_NETWORK",
      `Wrong network. Switch Freighter to ${network} and try again.`
    )
  }

  return { address: access.address, walletNetwork }
}

// ── Get Freighter network ──────────────────────────────────────────────────
async function getFreighterNetwork(): Promise<StellarNetwork> {
  const freighterApi = await import("@stellar/freighter-api")
  const { getNetworkDetails } =
    typeof freighterApi.getNetworkDetails === "function"
      ? freighterApi
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (freighterApi as any).default

  return getFreighterNetworkInternal(getNetworkDetails)
}

async function getFreighterNetworkInternal(
  getNetworkDetails: () => Promise<{ networkPassphrase: string; error?: string }>
): Promise<StellarNetwork> {
  const networkDetails = await getNetworkDetails()
  if (networkDetails.error) {
    throw new Error(networkDetails.error)
  }

  // Determine network from passphrase
  if (networkDetails.networkPassphrase === "Public Global Stellar Network ; September 2015") {
    return "mainnet"
  }
  if (networkDetails.networkPassphrase === "Test SDF Network ; September 2015") {
    return "testnet"
  }

  throw new Error(`Unknown network passphrase: ${networkDetails.networkPassphrase}`)
}
