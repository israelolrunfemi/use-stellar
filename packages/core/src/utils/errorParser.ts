import type { StellarError, StellarErrorCode } from "../types"

export function parseStellarError(error: unknown): StellarError {
  // 1. Pass-through if it's already a structured StellarError
  if (error && typeof error === "object" && "code" in error && "message" in error) {
    return error as StellarError
  }

  const rawMessage = error instanceof Error ? error.message : String(error)
  let code: StellarErrorCode = "UNKNOWN"
  let message = rawMessage

  // Type guard for Axios/Horizon style error responses
  const hasResponseData = error && typeof error === "object" && "response" in error
  const responseData: any = hasResponseData ? (error as any).response?.data : null

  // 2. Map Horizon Errors
  if (responseData?.extras?.result_codes) {
    const resultCodes = responseData.extras.result_codes
    const operations = resultCodes.operations || []

    if (operations.includes("op_no_trust")) {
      code = "NO_TRUSTLINE"
      message = "The destination account does not trust the asset you are trying to send."
    } else if (operations.includes("op_underfunded")) {
      code = "INSUFFICIENT_BALANCE"
      message = "The account does not have sufficient funds to complete this transaction."
    } else if (resultCodes.transaction === "tx_failed") {
      code = "TRANSACTION_REJECTED"
      message = "The transaction failed on the network."
    }
  }

  // 3. Map Freighter / Wallet Rejections
  const lowerMessage = rawMessage.toLowerCase()
  if (lowerMessage.includes("user declined") || lowerMessage.includes("rejected")) {
    code = "TRANSACTION_REJECTED"
    message = "The transaction was rejected in the wallet."
  } else if (lowerMessage.includes("not installed") || lowerMessage.includes("not found")) {
    code = "WALLET_NOT_INSTALLED"
    message = "Freighter wallet is not installed or not detected."
  }

  // 4. Map 404s
  const status = hasResponseData ? (error as any).response?.status : null
  if (status === 404 || rawMessage.includes("404")) {
    code = "ACCOUNT_NOT_FOUND"
    message = "The requested account or resource could not be found on the ledger."
  }

  return {
    code,
    message,
    raw: error,
  }
}
