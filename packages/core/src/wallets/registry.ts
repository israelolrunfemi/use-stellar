import type { StellarNetwork, WalletType } from "../types"
import type { WalletAdapter } from "./types"
import { WalletAdapterError } from "./types"
import { freighterAdapter, NETWORK_PASSPHRASES } from "./freighterAdapter"

function createUnsupportedAdapter(type: WalletType, name: string): WalletAdapter {
  const createError = () =>
    new WalletAdapterError("wallet_unsupported", `${name} is not supported yet.`)

  return {
    metadata: {
      type,
      name,
      supported: false,
    },
    async isAvailable() {
      return false
    },
    async connect() {
      throw createError()
    },
    async getNetworkDetails(network: StellarNetwork) {
      return {
        network,
        networkPassphrase: NETWORK_PASSPHRASES[network],
      }
    },
    async signTransaction() {
      throw createError()
    },
  }
}

const WALLET_ADAPTERS: Record<WalletType, WalletAdapter> = {
  freighter: freighterAdapter,
  albedo: createUnsupportedAdapter("albedo", "Albedo"),
  rabet: createUnsupportedAdapter("rabet", "Rabet"),
}

export function getWalletAdapter(walletType: WalletType): WalletAdapter {
  return WALLET_ADAPTERS[walletType]
}

export function getWalletAdapters(): WalletAdapter[] {
  return Object.values(WALLET_ADAPTERS)
}
