import type { Dispatch, SetStateAction } from "react"

/**
 * Represents the Stellar network environment.
 */
export type StellarNetwork = "testnet" | "mainnet"

/**
 * Configuration details for a specific Stellar network.
 */
export interface NetworkConfig {
  network: StellarNetwork
  horizonUrl: string
  sorobanUrl: string
}

/**
 * Pre-defined configurations for supported Stellar networks.
 */
export const NETWORK_CONFIGS: Record<StellarNetwork, NetworkConfig> = {
  testnet: {
    network: "testnet",
    horizonUrl: "https://horizon-testnet.stellar.org",
    sorobanUrl: "https://soroban-testnet.stellar.org",
  },
  mainnet: {
    network: "mainnet",
    horizonUrl: "https://horizon.stellar.org",
    sorobanUrl: "https://soroban.stellar.org",
  },
}

/**
 * Supported wallet providers.
 */
export type WalletType = "freighter" | "albedo" | "rabet"

export type StellarErrorCode =
  | "ACCOUNT_NOT_FOUND"
  | "INSUFFICIENT_BALANCE"
  | "NO_TRUSTLINE"
  | "TRANSACTION_REJECTED"
  | "WALLET_NOT_INSTALLED"
  | "WALLET_NOT_CONNECTED"
  | "NETWORK_ERROR"
  | "UNKNOWN"

export interface StellarError {
  code: StellarErrorCode
  message: string
  raw?: unknown
}

/**
 * The current state of the wallet connection.
 */
export interface WalletState {
  connected: boolean
  address: string | null
  network: StellarNetwork | null
  wallet: WalletType | null
  connecting: boolean
  error: string | null
}

/**
 * Represents the native Stellar asset (XLM).
 */
export type NativeAsset = "XLM"

/**
 * Represents a custom issued asset on the Stellar network.
 */
export interface IssuedAsset {
  code: string
  issuer: string
}

export interface LiquidityPoolAsset {
  asset: "liquidity_pool_shares"
  liquidityPoolId: string
}

/**
 * Can be either a native asset or an issued asset.
 */
export type Asset = NativeAsset | IssuedAsset

/**
 * Represents a balance entry for an account.
 */
export type Balance =
  | {
      asset: "XLM"
      balance: string
    }
  | {
      asset: {
        code: string
        issuer: string
      }
      balance: string
      limit: string
    }
  | {
      asset: "liquidity_pool_shares"
      balance: string
      liquidityPoolId: string
    }

/**
 * Detailed account information from the Stellar network.
 */
export interface AccountInfo {
  address: string
  sequence: string
  balances: Balance[]
  subentryCount: number
  thresholds: {
    lowThreshold: number
    medThreshold: number
    highThreshold: number
  }
  signers: {
    key: string
    weight: number
    type: string
  }[]
}

/**
 * The current status of a transaction on the network.
 */
export type TransactionStatus = "pending" | "success" | "failed" | "not_found"

/**
 * Result details from a submitted or queried transaction.
 */
export interface TransactionResult {
  hash: string
  status: TransactionStatus
  ledger?: number
  createdAt?: string
  fee?: string
  envelope?: string
}

/**
 * Options for sending a payment transaction.
 */
export interface SendPaymentOptions {
  to: string
  asset: Asset
  amount: string
  memo?: string
}

/**
 * Result returned after a payment is sent.
 */
export interface SendPaymentResult {
  hash: string
  status: TransactionStatus
}

/**
 * Options for calling a Soroban smart contract.
 */
export interface ContractCallOptions {
  contractId: string
  method: string
  args?: unknown[]
}

export interface ClaimableBalanceClaimant {
  destination: string
  predicate: object
}

export interface ClaimableBalance {
  id: string
  asset: string
  amount: string
  claimants: ClaimableBalanceClaimant[]
  sponsor?: string
}

/**
 * Context value provided by the StellarProvider.
 */
export interface StellarContextValue {
  network: StellarNetwork
  networkConfig: NetworkConfig
  wallet: WalletState
  setWallet: Dispatch<SetStateAction<WalletState>>
}
