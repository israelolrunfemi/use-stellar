// Stellar React SDK - Main entry point
// ── Provider ───────────────────────────────────────────────────────────────
export { StellarProvider } from "./context/StellarProvider"

// ── Hooks ──────────────────────────────────────────────────────────────────
export { useWallet } from "./hooks/useWallet"
export { useBalance } from "./hooks/useBalance"
export { useAccount } from "./hooks/useAccount"
export { useSendPayment } from "./hooks/useSendPayment"
export { useTransaction } from "./hooks/useTransaction"
export type { UseTransactionOptions, UseTransactionReturn } from "./hooks/useTransaction"
export { useNetwork } from "./hooks/useNetwork"
export { useAsset } from "./hooks/useAsset"
export { useSorobanContract } from "./hooks/useSorobanContract"
export { usePayments } from "./hooks/usePayments"
export { useClaimableBalance } from "./hooks/useClaimableBalance"

export {
  FREIGHTER_WALLET_TYPE,
  NETWORK_PASSPHRASES,
  WalletAdapterError,
  freighterAdapter,
  getWalletAdapter,
  getWalletAdapters,
} from "./wallets"

// ── Errors ─────────────────────────────────────────────────────────────────
export {
  StellarError,
  createStellarError,
  toStellarError,
  isStellarError,
  isStellarErrorCode,
  STELLAR_ERROR_CODES,
  DEFAULT_ERROR_MESSAGES,
} from "./errors"
export type { StellarErrorCode, StellarErrorOptions } from "./errors"

// ── Utilities ────────────────────────────────────────────────────────────
export {
  isBrowser,
  isValidAssetCode,
  isValidStellarAddress,
  shortenAddress,
  formatAmount,
  formatAssetCode,
} from "./utils"

// ── Types ──────────────────────────────────────────────────────────────────
export type {
  StellarNetwork,
  NetworkConfig,
  WalletType,
  WalletState,
  Asset,
  NativeAsset,
  IssuedAsset,
  Balance,
  AccountInfo,
  TransactionResult,
  TransactionStatus,
  SendPaymentOptions,
  SendPaymentResult,
  NormalizedPayment,
  ContractCallOptions,
  StellarContextValue,
  UsePaymentsOptions,
  UsePaymentsReturn,
  ClaimableBalance,
  ClaimableBalanceClaimant,
} from "./types"
export type {
  SignTransactionOptions,
  WalletAdapter,
  WalletAdapterErrorCode,
  WalletAdapterMetadata,
  WalletConnection,
  WalletNetworkDetails,
} from "./wallets"
