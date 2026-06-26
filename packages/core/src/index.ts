// ── Provider ───────────────────────────────────────────────────────────────
export { StellarProvider }      from "./context/StellarProvider";

// ── Hooks ──────────────────────────────────────────────────────────────────
export { useWallet }            from "./hooks/useWallet";
export { useBalance }           from "./hooks/useBalance";
export { useAccount }           from "./hooks/useAccount";
export { useSendPayment }       from "./hooks/useSendPayment";
export { useTransaction }       from "./hooks/useTransaction";
export { useNetwork }           from "./hooks/useNetwork";
export { useAsset }             from "./hooks/useAsset";
export { useSorobanContract }   from "./hooks/useSorobanContract";
export { usePayments }          from "./hooks/usePayments";
export { useClaimableBalance }  from "./hooks/useClaimableBalance";

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
} from "./types";

// ── Utils (public) ─────────────────────────────────────────────────────────
export {
  isValidStellarAddress,
  shortenAddress,
  formatAmount,
  formatAssetCode,
} from "./utils";
