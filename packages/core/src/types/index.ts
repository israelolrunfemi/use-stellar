import type { Dispatch, SetStateAction } from "react";

export type StellarNetwork = "testnet" | "mainnet";

export interface NetworkConfig {
  network: StellarNetwork;
  horizonUrl: string;
  sorobanUrl: string;
}

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
};

export type StellarErrorCode =
  | "ACCOUNT_NOT_FOUND"
  | "INSUFFICIENT_BALANCE"
  | "NO_TRUSTLINE"
  | "TRANSACTION_REJECTED"
  | "WALLET_NOT_INSTALLED"
  | "WALLET_NOT_CONNECTED"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export interface StellarError {
  code: StellarErrorCode;
  message: string;
  raw?: unknown;
}

export type WalletType = "freighter" | "albedo" | "rabet";

export interface WalletState {
  connected: boolean;
  address: string | null;
  network: StellarNetwork | null;
  wallet: WalletType | null;
  connecting: boolean;
  error: string | null;
}

export type NativeAsset = "XLM";

export interface IssuedAsset {
  code: string;
  issuer: string;
}

export type Asset = NativeAsset | IssuedAsset;

export interface Balance {
  asset: Asset;
  balance: string;
  limit?: string;
  buying?: string;
  selling?: string;
}

export interface AccountInfo {
  address: string;
  sequence: string;
  balances: Balance[];
  subentryCount: number;
  thresholds: {
    lowThreshold: number;
    medThreshold: number;
    highThreshold: number;
  };
  signers: {
    key: string;
    weight: number;
    type: string;
  }[];
}

export type TransactionStatus = "pending" | "success" | "failed" | "not_found";

export interface TransactionResult {
  hash: string;
  status: TransactionStatus;
  ledger?: number;
  createdAt?: string;
  fee?: string;
}

export interface SendPaymentOptions {
  to: string;
  asset: Asset;
  amount: string;
  memo?: string;
}

export interface SendPaymentResult {
  hash: string;
  status: TransactionStatus;
}

export interface ContractCallOptions {
  contractId: string;
  method: string;
  args?: unknown[];
}

export interface ClaimableBalanceClaimant {
  destination: string;
  predicate: object;
}

export interface ClaimableBalance {
  id: string;
  asset: string;
  amount: string;
  claimants: ClaimableBalanceClaimant[];
  sponsor?: string;
}

export interface StellarContextValue {
  network: StellarNetwork;
  networkConfig: NetworkConfig;
  wallet: WalletState;
  setWallet: Dispatch<SetStateAction<WalletState>>;
}
