export { StellarProvider } from "./context/StellarProvider";

export { useWallet } from "./hooks/useWallet";
export { useBalance } from "./hooks/useBalance";
export { useAccount } from "./hooks/useAccount";
export { useSendPayment } from "./hooks/useSendPayment";
export { useTransaction } from "./hooks/useTransaction";
export { useNetwork } from "./hooks/useNetwork";
export { useAsset } from "./hooks/useAsset";
export { useSorobanContract } from "./hooks/useSorobanContract";
export {
  FREIGHTER_WALLET_TYPE,
  NETWORK_PASSPHRASES,
  WalletAdapterError,
  freighterAdapter,
  getWalletAdapter,
  getWalletAdapters,
} from "./wallets";

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
} from "./types";
export type {
  SignTransactionOptions,
  WalletAdapter,
  WalletAdapterErrorCode,
  WalletAdapterMetadata,
  WalletConnection,
  WalletNetworkDetails,
} from "./wallets";

export {
  isValidStellarAddress,
  shortenAddress,
  formatAmount,
  formatAssetCode,
} from "./utils";
