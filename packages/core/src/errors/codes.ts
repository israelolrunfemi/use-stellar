/**
 * Stable, machine-readable error codes shared across every use-stellar hook.
 *
 * Codes are grouped by failure domain so consumers can branch on a category
 * (e.g. anything starting with `WALLET_`) or on a single code. The string
 * values are part of the public contract — never rename an existing one.
 */
export const STELLAR_ERROR_CODES = {
  // ── Wallet ─────────────────────────────────────────────────────────────
  /** Freighter (or the selected wallet) is not installed / not detected. */
  WALLET_NOT_INSTALLED: "WALLET_NOT_INSTALLED",
  /** An action required a connected wallet but none was connected. */
  WALLET_NOT_CONNECTED: "WALLET_NOT_CONNECTED",
  /** The user rejected the request in their wallet. */
  WALLET_REQUEST_REJECTED: "WALLET_REQUEST_REJECTED",
  /** The wallet is connected to a different network than the provider. */
  WRONG_NETWORK: "WRONG_NETWORK",

  // ── Horizon / transaction ──────────────────────────────────────────────
  /** The requested account or resource does not exist on the ledger (404). */
  ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
  /** The source account lacks the funds to complete the operation. */
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  /** The destination does not hold a trustline for the asset. */
  NO_TRUSTLINE: "NO_TRUSTLINE",
  /** The transaction was submitted but failed on the network. */
  TRANSACTION_FAILED: "TRANSACTION_FAILED",
  /** Horizon rate-limited the request (429). */
  RATE_LIMITED: "RATE_LIMITED",

  // ── Validation ─────────────────────────────────────────────────────────
  /** Caller-supplied input was invalid or the environment was unsupported. */
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // ── Network ────────────────────────────────────────────────────────────
  /** A transport-level failure (offline, DNS, timeout, CORS, etc.). */
  NETWORK_ERROR: "NETWORK_ERROR",

  // ── Fallback ───────────────────────────────────────────────────────────
  /** Anything we could not confidently classify. */
  UNKNOWN: "UNKNOWN",
} as const

/** The union of every supported {@link STELLAR_ERROR_CODES} value. */
export type StellarErrorCode = (typeof STELLAR_ERROR_CODES)[keyof typeof STELLAR_ERROR_CODES]

/** Default human-readable message for each code, shown directly in demos. */
export const DEFAULT_ERROR_MESSAGES: Record<StellarErrorCode, string> = {
  WALLET_NOT_INSTALLED: "Freighter wallet is not installed or could not be detected.",
  WALLET_NOT_CONNECTED: "Wallet is not connected. Connect a wallet and try again.",
  WALLET_REQUEST_REJECTED: "The request was rejected in the wallet.",
  WRONG_NETWORK: "The wallet is connected to the wrong network.",
  ACCOUNT_NOT_FOUND: "The requested account or resource could not be found on the ledger.",
  INSUFFICIENT_BALANCE: "The account does not have sufficient funds to complete this transaction.",
  NO_TRUSTLINE: "The destination account does not trust the asset you are trying to send.",
  TRANSACTION_FAILED: "The transaction failed on the network.",
  RATE_LIMITED: "Too many requests were sent to Horizon. Please slow down and try again.",
  VALIDATION_ERROR: "The provided input is invalid.",
  NETWORK_ERROR: "Unable to reach the Stellar network. Check your connection and try again.",
  UNKNOWN: "An unknown error occurred.",
}

/** Type guard: is `value` one of the known {@link StellarErrorCode}s? */
export function isStellarErrorCode(value: unknown): value is StellarErrorCode {
  return typeof value === "string" && value in DEFAULT_ERROR_MESSAGES
}
