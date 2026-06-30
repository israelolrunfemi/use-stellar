import {
  createStellarError,
  toStellarError,
  StellarError,
  isStellarError,
  isStellarErrorCode,
  DEFAULT_ERROR_MESSAGES,
  STELLAR_ERROR_CODES,
} from "./index"

// Helper to fabricate a Horizon/Axios style error.
function horizonError(options: {
  status?: number
  resultCodes?: { transaction?: string; operations?: string[] }
  message?: string
}) {
  return {
    message: options.message ?? "Request failed",
    response: {
      status: options.status,
      data: options.resultCodes ? { extras: { result_codes: options.resultCodes } } : undefined,
    },
  }
}

describe("StellarError class", () => {
  it("is a real Error subclass that can be thrown and caught", () => {
    expect(() => {
      throw createStellarError("WALLET_NOT_CONNECTED")
    }).toThrow(StellarError)

    const err = createStellarError("WALLET_NOT_CONNECTED")
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(StellarError)
    expect(err.name).toBe("StellarError")
  })

  it("uses the default message when none is provided", () => {
    const err = createStellarError("NO_TRUSTLINE")
    expect(err.code).toBe("NO_TRUSTLINE")
    expect(err.message).toBe(DEFAULT_ERROR_MESSAGES.NO_TRUSTLINE)
  })

  it("keeps a custom message and the raw cause", () => {
    const raw = new Error("boom")
    const err = createStellarError("WRONG_NETWORK", "Switch to testnet", { raw })
    expect(err.message).toBe("Switch to testnet")
    expect(err.raw).toBe(raw)
  })
})

describe("isStellarError / isStellarErrorCode", () => {
  it("recognises real instances and plain objects with a known code", () => {
    expect(isStellarError(createStellarError("UNKNOWN"))).toBe(true)
    expect(isStellarError({ code: "RATE_LIMITED", message: "slow down" })).toBe(true)
  })

  it("rejects unrelated objects (e.g. an Axios error with its own code)", () => {
    expect(isStellarError({ code: "ERR_BAD_REQUEST", message: "nope" })).toBe(false)
    expect(isStellarError(new Error("plain"))).toBe(false)
    expect(isStellarError(null)).toBe(false)
  })

  it("validates error codes", () => {
    expect(isStellarErrorCode("NETWORK_ERROR")).toBe(true)
    expect(isStellarErrorCode("NOT_A_CODE")).toBe(false)
    expect(Object.keys(STELLAR_ERROR_CODES)).toContain("RATE_LIMITED")
  })
})

describe("toStellarError — Horizon result codes", () => {
  it("maps op_no_trust → NO_TRUSTLINE", () => {
    const err = toStellarError(
      horizonError({ status: 400, resultCodes: { operations: ["op_no_trust"] } })
    )
    expect(err.code).toBe("NO_TRUSTLINE")
    expect(err.message).toBe(DEFAULT_ERROR_MESSAGES.NO_TRUSTLINE)
  })

  it("maps op_underfunded → INSUFFICIENT_BALANCE", () => {
    const err = toStellarError(
      horizonError({ status: 400, resultCodes: { operations: ["op_underfunded"] } })
    )
    expect(err.code).toBe("INSUFFICIENT_BALANCE")
  })

  it("maps tx_insufficient_balance → INSUFFICIENT_BALANCE", () => {
    const err = toStellarError(
      horizonError({ status: 400, resultCodes: { transaction: "tx_insufficient_balance" } })
    )
    expect(err.code).toBe("INSUFFICIENT_BALANCE")
  })

  it("maps a generic failed transaction → TRANSACTION_FAILED", () => {
    const err = toStellarError(
      horizonError({
        status: 400,
        resultCodes: { transaction: "tx_failed", operations: ["op_bad_auth"] },
      })
    )
    expect(err.code).toBe("TRANSACTION_FAILED")
  })

  it("prioritises operation codes over the transaction code", () => {
    const err = toStellarError(
      horizonError({
        status: 400,
        resultCodes: { transaction: "tx_failed", operations: ["op_no_trust"] },
      })
    )
    expect(err.code).toBe("NO_TRUSTLINE")
  })
})

describe("toStellarError — HTTP status codes", () => {
  it("maps 429 → RATE_LIMITED", () => {
    expect(toStellarError(horizonError({ status: 429 })).code).toBe("RATE_LIMITED")
  })

  it("maps a 404 status → ACCOUNT_NOT_FOUND", () => {
    expect(toStellarError(horizonError({ status: 404 })).code).toBe("ACCOUNT_NOT_FOUND")
  })

  it("maps a '404' message with no response object → ACCOUNT_NOT_FOUND", () => {
    expect(toStellarError(new Error("Request failed with status code 404")).code).toBe(
      "ACCOUNT_NOT_FOUND"
    )
  })
})

describe("toStellarError — wallet heuristics", () => {
  it.each(["User declined access", "Request was rejected by the user", "Access denied"])(
    "maps %p → WALLET_REQUEST_REJECTED",
    message => {
      expect(toStellarError(new Error(message)).code).toBe("WALLET_REQUEST_REJECTED")
    }
  )

  it.each(["Freighter is not installed", "Wallet not detected", "Freighter wallet not found"])(
    "maps %p → WALLET_NOT_INSTALLED",
    message => {
      expect(toStellarError(new Error(message)).code).toBe("WALLET_NOT_INSTALLED")
    }
  )
})

describe("toStellarError — network heuristics", () => {
  it.each([
    "Network Error",
    "Network request failed",
    "Failed to fetch",
    "connect ECONNREFUSED 127.0.0.1:443",
    "socket hang up timeout",
  ])("maps %p → NETWORK_ERROR", message => {
    expect(toStellarError(new Error(message)).code).toBe("NETWORK_ERROR")
  })
})

describe("toStellarError — fallback & pass-through", () => {
  it("falls back to UNKNOWN while preserving the original message", () => {
    const err = toStellarError(new Error("something weird happened"))
    expect(err.code).toBe("UNKNOWN")
    expect(err.message).toBe("something weird happened")
  })

  it("stringifies non-Error throws under UNKNOWN", () => {
    expect(toStellarError("boom").code).toBe("UNKNOWN")
    expect(toStellarError("boom").message).toBe("boom")
  })

  it("returns an existing StellarError instance unchanged", () => {
    const original = createStellarError("WRONG_NETWORK", "switch")
    expect(toStellarError(original)).toBe(original)
  })

  it("normalises a plain StellarError-shaped object into a real instance", () => {
    const plain = { code: STELLAR_ERROR_CODES.RATE_LIMITED, message: "slow down", raw: 1 }
    const err = toStellarError(plain)
    expect(err).toBeInstanceOf(StellarError)
    expect(err.code).toBe("RATE_LIMITED")
    expect(err.message).toBe("slow down")
    expect(err.raw).toBe(plain)
  })

  it("does not misclassify an Axios error whose code is not a StellarErrorCode", () => {
    const axiosLike = { code: "ERR_BAD_RESPONSE", message: "Some odd failure" }
    expect(toStellarError(axiosLike).code).toBe("UNKNOWN")
  })

  it("always attaches the raw error for debugging", () => {
    const raw = horizonError({ status: 429 })
    expect(toStellarError(raw).raw).toBe(raw)
  })
})
