import { useCallback } from "react"
import { useStellarContext } from "../context/StellarProvider"
import { isBrowser } from "../utils"
import { createStellarError, toStellarError } from "../errors"
import type { WalletState, WalletType } from "../types"

export interface UseWalletReturn extends WalletState {
  connect: (wallet?: WalletType) => Promise<void>
  disconnect: () => void
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

        if (walletType === "freighter") {
          address = await connectFreighter(network)
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
    })
  }, [setWallet])

  return { ...wallet, connect, disconnect }
}

// ── Freighter connector ────────────────────────────────────────────────────
async function connectFreighter(network: string): Promise<string> {
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

  const networkDetails = await getNetworkDetails()
  if (networkDetails.error) {
    throw new Error(networkDetails.error.message)
  }

  // Validate we're on the right network
  const expectedPassphrase =
    network === "mainnet"
      ? "Public Global Stellar Network ; September 2015"
      : "Test SDF Network ; September 2015"

  if (networkDetails.networkPassphrase !== expectedPassphrase) {
    throw createStellarError(
      "WRONG_NETWORK",
      `Wrong network. Switch Freighter to ${network} and try again.`
    )
  }

  return access.address
}
