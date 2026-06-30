import {
  getNetworkDetails,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api"
import type { StellarNetwork } from "../types"
import type { WalletAdapter, WalletNetworkDetails } from "./types"
import { WalletAdapterError } from "./types"

export const FREIGHTER_WALLET_TYPE = "freighter" as const

export const NETWORK_PASSPHRASES: Record<StellarNetwork, string> = {
  mainnet: "Public Global Stellar Network ; September 2015",
  testnet: "Test SDF Network ; September 2015",
}

async function getFreighterNetworkDetails(network: StellarNetwork): Promise<WalletNetworkDetails> {
  const details = await getNetworkDetails()
  if (details.error) {
    throw new WalletAdapterError("wallet_access_rejected", details.error.message)
  }

  const expectedPassphrase = NETWORK_PASSPHRASES[network]
  if (details.networkPassphrase !== expectedPassphrase) {
    throw new WalletAdapterError(
      "wallet_network_mismatch",
      `Wrong network. Switch Freighter to ${network} and try again.`
    )
  }

  return {
    network,
    networkPassphrase: expectedPassphrase,
  }
}

export const freighterAdapter: WalletAdapter = {
  metadata: {
    type: FREIGHTER_WALLET_TYPE,
    name: "Freighter",
    supported: true,
  },

  async isAvailable() {
    const connection = await isConnected()
    return Boolean(connection.isConnected && !connection.error)
  },

  async connect(network) {
    const connection = await isConnected()
    if (connection.error || !connection.isConnected) {
      throw new WalletAdapterError(
        "wallet_unavailable",
        "Freighter wallet not found. Install the Freighter browser extension and try again."
      )
    }

    const access = await requestAccess()
    if (access.error) {
      throw new WalletAdapterError("wallet_access_rejected", access.error.message)
    }

    if (!access.address) {
      throw new WalletAdapterError(
        "wallet_access_rejected",
        "Freighter did not return a wallet address."
      )
    }

    const networkDetails = await getFreighterNetworkDetails(network)

    return {
      address: access.address,
      wallet: FREIGHTER_WALLET_TYPE,
      ...networkDetails,
    }
  },

  getNetworkDetails: getFreighterNetworkDetails,

  async signTransaction(xdr, options) {
    const signedTransaction = await signTransaction(xdr, {
      networkPassphrase: options.networkPassphrase,
      address: options.address,
    })

    if (signedTransaction.error) {
      throw new WalletAdapterError("wallet_sign_failed", signedTransaction.error.message)
    }

    if (!signedTransaction.signedTxXdr) {
      throw new WalletAdapterError(
        "wallet_sign_failed",
        "Freighter did not return a signed transaction."
      )
    }

    return signedTransaction.signedTxXdr
  },
}
