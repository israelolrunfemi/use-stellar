import { type StellarErrorCode } from "./codes"
import { isStellarError, StellarError, type StellarErrorOptions } from "./StellarError"

/**
 * Create a typed {@link StellarError}. When `message` is omitted the default
 * human-readable message for `code` is used.
 *
 * @example
 * throw createStellarError("WALLET_NOT_CONNECTED")
 * throw createStellarError("WRONG_NETWORK", `Switch Freighter to ${network}.`)
 */
export function createStellarError(
  code: StellarErrorCode,
  message?: string,
  options?: StellarErrorOptions
): StellarError {
  return new StellarError(code, message, options)
}

// ── Internal: best-effort extraction of a Horizon/Axios style response ──────
interface HorizonResultCodes {
  transaction?: string
  operations?: string[]
}

interface HorizonLikeResponse {
  status?: number
  data?: { extras?: { result_codes?: HorizonResultCodes } }
}

function getResponse(error: unknown): HorizonLikeResponse | undefined {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: unknown }).response
    if (response && typeof response === "object") return response as HorizonLikeResponse
  }
  return undefined
}

/**
 * Normalise any thrown value into a typed {@link StellarError}.
 *
 * Mapping precedence (most specific first):
 *  1. Already a `StellarError` → returned unchanged.
 *  2. Horizon transaction `result_codes` (`op_no_trust`, `op_underfunded`, …).
 *  3. HTTP status codes (`429` → rate limited, `404` → not found).
 *  4. Wallet message heuristics (user rejected / not installed).
 *  5. Transport/network failure heuristics.
 *  6. Fallback `UNKNOWN`, preserving the original message.
 */
export function toStellarError(error: unknown): StellarError {
  // 1. Pass-through anything already typed.
  if (error instanceof StellarError) {
    return error
  }
  if (isStellarError(error)) {
    // Plain object carrying a known code — normalise to a real instance.
    return new StellarError(error.code, error.message, { raw: error })
  }

  const rawMessage = error instanceof Error ? error.message : String(error)
  const response = getResponse(error)
  const status = response?.status
  const resultCodes = response?.data?.extras?.result_codes

  // 2. Horizon transaction result codes — the most actionable signal.
  if (resultCodes) {
    const operations = resultCodes.operations ?? []
    if (operations.includes("op_no_trust")) {
      return createStellarError("NO_TRUSTLINE", undefined, { raw: error })
    }
    if (
      operations.includes("op_underfunded") ||
      resultCodes.transaction === "tx_insufficient_balance"
    ) {
      return createStellarError("INSUFFICIENT_BALANCE", undefined, { raw: error })
    }
    if (resultCodes.transaction && resultCodes.transaction !== "tx_success") {
      return createStellarError("TRANSACTION_FAILED", undefined, { raw: error })
    }
  }

  // 3. HTTP status codes.
  if (status === 429) {
    return createStellarError("RATE_LIMITED", undefined, { raw: error })
  }
  if (status === 404 || /\b404\b/.test(rawMessage)) {
    return createStellarError("ACCOUNT_NOT_FOUND", undefined, { raw: error })
  }

  // 4. Wallet message heuristics (Freighter does not use status codes).
  const lower = rawMessage.toLowerCase()
  if (
    lower.includes("user declined") ||
    lower.includes("user rejected") ||
    lower.includes("rejected") ||
    lower.includes("denied")
  ) {
    return createStellarError("WALLET_REQUEST_REJECTED", undefined, { raw: error })
  }
  if (
    lower.includes("not installed") ||
    lower.includes("not detected") ||
    (lower.includes("freighter") && lower.includes("not found"))
  ) {
    return createStellarError("WALLET_NOT_INSTALLED", undefined, { raw: error })
  }

  // 5. Transport/network failures.
  if (
    lower.includes("network error") ||
    lower.includes("network request failed") ||
    lower.includes("failed to fetch") ||
    lower.includes("econnrefused") ||
    lower.includes("econnreset") ||
    lower.includes("enotfound") ||
    lower.includes("timeout") ||
    lower.includes("timed out")
  ) {
    return createStellarError("NETWORK_ERROR", undefined, { raw: error })
  }

  // 6. Fallback — keep the original message so nothing is silently swallowed.
  return createStellarError("UNKNOWN", rawMessage || undefined, { raw: error })
}
