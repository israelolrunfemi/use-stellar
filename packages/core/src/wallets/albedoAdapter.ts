import type { StellarNetwork } from "../types"
import type {
  WalletAdapter,
  WalletConnection,
  WalletNetworkDetails,
  SignTransactionOptions,
} from "./types"
import { WalletAdapterError } from "./types"
import { NETWORK_PASSPHRASES } from "./freighterAdapter"

function toAlbedoNetwork(network: StellarNetwork): "public" | "testnet" {
  return network === "mainnet" ? "public" : "testnet"
}

export const albedoAdapter: WalletAdapter = {
  metadata: {
    type: "albedo",
    name: "Albedo",
    supported: false,
  },

  async isAvailable() {
    // Albedo is web-popup based — no extension required, always available in a browser.
    return typeof window !== "undefined"
  },

  async connect(network: StellarNetwork): Promise<WalletConnection> {
    // Dynamic import keeps @albedo-link/intent out of the SSR/test bundle.
    const albedoModule = await import("@albedo-link/intent")
    const albedo = albedoModule.default ?? albedoModule

    try {
      const result = await albedo.publicKey({})

      if (!result.pubkey) {
        throw new WalletAdapterError(
          "wallet_access_rejected",
          "Albedo did not return a public key."
        )
      }

      return {
        address: result.pubkey,
        wallet: "albedo",
        network,
        networkPassphrase: NETWORK_PASSPHRASES[network],
      }
    } catch (err) {
      if (err instanceof WalletAdapterError) throw err
      throw new WalletAdapterError(
        "wallet_access_rejected",
        err instanceof Error ? err.message : "Albedo connection was rejected."
      )
    }
  },

  async getNetworkDetails(network: StellarNetwork): Promise<WalletNetworkDetails> {
    // Albedo doesn't expose a standalone "current network" query — the network
    // is confirmed per-request (connect/sign), so we return the requested network.
    return {
      network,
      networkPassphrase: NETWORK_PASSPHRASES[network],
    }
  },

  async signTransaction(xdr: string, options: SignTransactionOptions): Promise<string> {
    const albedoModule = await import("@albedo-link/intent")
    const albedo = albedoModule.default ?? albedoModule

    try {
      const result = await albedo.tx({
        xdr,
        network: toAlbedoNetwork(options.network),
        pubkey: options.address,
        submit: false,
      })

      if (!result.signed_envelope_xdr) {
        throw new WalletAdapterError(
          "wallet_sign_failed",
          "Albedo did not return a signed transaction."
        )
      }

      return result.signed_envelope_xdr
    } catch (err) {
      if (err instanceof WalletAdapterError) throw err
      throw new WalletAdapterError(
        "wallet_sign_failed",
        err instanceof Error ? err.message : "Albedo failed to sign the transaction."
      )
    }
  },
}
