// ── Network ────────────────────────────────────────────────────────────────
export type StellarNetwork = "testnet" | "mainnet";

export interface NetworkConfig {
  network:    StellarNetwork;
  horizonUrl: string;
  sorobanUrl: string;
}

export const NETWORK_CONFIGS: Record<StellarNetwork, NetworkConfig> = {
  testnet: {
    network:    "testnet",
    horizonUrl: "https://horizon-testnet.stellar.org",
    sorobanUrl: "https://soroban-testnet.stellar.org",
  },
  mainnet: {
    network:    "mainnet",
    horizonUrl: "https://horizon.stellar.org",
    sorobanUrl: "https://soroban.stellar.org",
  },
};

// ── Wallet ─────────────────────────────────────────────────────────────────
export type WalletType = "freighter" | "albedo" | "rabet";
// More wallets tracked as GitHub issues

export interface WalletState {
  connected:  boolean;
  address:    string | null;
  network:    StellarNetwork | null;
  wallet:     WalletType | null;
  connecting: boolean;
  error:      string | null;
}

// ── Asset ──────────────────────────────────────────────────────────────────
export type NativeAsset = "XLM";

export interface IssuedAsset {
  code:   string;   // e.g. "USDC"
  issuer: string;   // Stellar address of the issuer
}

export type Asset = NativeAsset | IssuedAsset;

// ── Balance ────────────────────────────────────────────────────────────────
export interface Balance {
  asset:     Asset;
  balance:   string;
  limit?:    string;   // trustline limit for issued assets
  buying?:   string;   // buying liabilities
  selling?:  string;   // selling liabilities
}

// ── Account ────────────────────────────────────────────────────────────────
export interface AccountInfo {
  address:        string;
  sequence:       string;
  balances:       Balance[];
  subentryCount:  number;
  thresholds: {
    lowThreshold:    number;
    medThreshold:    number;
    highThreshold:   number;
  };
  signers: {
    key:    string;
    weight: number;
    type:   string;
  }[];
}

// ── Transaction ────────────────────────────────────────────────────────────
export type TransactionStatus = "pending" | "success" | "failed" | "not_found";

export interface TransactionResult {
  hash:       string;
  status:     TransactionStatus;
  ledger?:    number;
  createdAt?: string;
  fee?:       string;
}

// ── Payment ────────────────────────────────────────────────────────────────
export interface SendPaymentOptions {
  to:     string;    // destination Stellar address
  asset:  Asset;
  amount: string;    // string to avoid float precision issues
  memo?:  string;
}

export interface SendPaymentResult {
  hash:   string;
  status: TransactionStatus;
}

// ── Soroban ────────────────────────────────────────────────────────────────
export interface ContractCallOptions {
  contractId: string;
  method:     string;
  args?:      unknown[];
}

// ── Provider ───────────────────────────────────────────────────────────────
export interface StellarContextValue {
  network:       StellarNetwork;
  networkConfig: NetworkConfig;
  wallet:        WalletState;
  setWallet:     (state: WalletState) => void;
}
