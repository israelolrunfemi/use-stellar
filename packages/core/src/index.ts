// Stellar React SDK - Main entry point
// ── Provider ───────────────────────────────────────────────────────────────
export { StellarProvider } from "./context/StellarProvider"

// ── Hooks ──────────────────────────────────────────────────────────────────
export { useWallet }            from "./hooks/useWallet";
export { useBalance }           from "./hooks/useBalance";
export { useAccount }           from "./hooks/useAccount";
export { useFriendbot }         from "./hooks/useFriendbot";
export { useSendPayment }       from "./hooks/useSendPayment";
export { useTransaction }       from "./hooks/useTransaction";
export { useNetwork }           from "./hooks/useNetwork";
export { useAsset }             from "./hooks/useAsset";
export { useSorobanContract }   from "./hooks/useSorobanContract";
export { usePayments }          from "./hooks/usePayments";
export { useClaimableBalance }  from "./hooks/useClaimableBalance";
export { useWallet } from "./hooks/useWallet"
export { useBalance } from "./hooks/useBalance"
export { useAccount } from "./hooks/useAccount"
export { useSendPayment } from "./hooks/useSendPayment"
export { useTransaction } from "./hooks/useTransaction"
export type { UseTransactionOptions, UseTransactionReturn } from "./hooks/useTransaction"
export { useNetwork } from "./hooks/useNetwork"
export { useAsset } from "./hooks/useAsset"
export { useSorobanContract } from "./hooks/useSorobanContract"
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

// ── Validation utilities ────────────────────────────────────────────────────
export { isValidAssetCode, isValidStellarAddress } from "./utils"

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
  ContractCallOptions,
  StellarContextValue,
  NormalizedPayment,
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

export {
  isBrowser,
  isValidStellarAddress,
  shortenAddress,
  formatAmount,
  formatAssetCode,
} from "./utils"
