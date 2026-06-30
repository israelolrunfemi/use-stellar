import type { StellarNetwork, WalletType } from "../types"

export type WalletAdapterErrorCode =
  | "wallet_unavailable"
  | "wallet_unsupported"
  | "wallet_access_rejected"
  | "wallet_network_mismatch"
  | "wallet_sign_failed"

export class WalletAdapterError extends Error {
  constructor(
    public readonly code: WalletAdapterErrorCode,
    message: string
  ) {
    super(message)
    this.name = "WalletAdapterError"
  }
}

export interface WalletAdapterMetadata {
  type: WalletType
  name: string
  supported: boolean
}

export interface WalletNetworkDetails {
  network: StellarNetwork
  networkPassphrase: string
}

export interface WalletConnection extends WalletNetworkDetails {
  address: string
  wallet: WalletType
}

export interface SignTransactionOptions extends WalletNetworkDetails {
  address: string
}

export interface WalletAdapter {
  metadata: WalletAdapterMetadata
  isAvailable: () => Promise<boolean>
  connect: (network: StellarNetwork) => Promise<WalletConnection>
  disconnect?: () => void | Promise<void>
  getNetworkDetails: (network: StellarNetwork) => Promise<WalletNetworkDetails>
  signTransaction: (xdr: string, options: SignTransactionOptions) => Promise<string>
}
