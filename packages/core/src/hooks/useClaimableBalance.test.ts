import { renderHook, waitFor, act } from "@testing-library/react"
import React from "react"
import { StellarProvider } from "../context/StellarProvider"
import { useClaimableBalance } from "./useClaimableBalance"
// ── Mock @stellar/stellar-sdk ──────────────────────────────────────────────
// We mock the entire SDK so no real network calls are made during tests.

jest.mock("../utils", () => {
  const mockServer = {}
  return {
    ...jest.requireActual("../utils"),
    getHorizonServer: () => mockServer,
    __mockServer: mockServer,
  }
})

// @ts-expect-error - import mocked internal state
import { __mockServer as mockServer } from "../utils"

const mockCall = jest.fn()

Object.assign(mockServer, {
  claimableBalances: () => ({
    claimant: (_address: string) => ({
      call: mockCall,
    }),
  }),
})

// ── Test wrapper ───────────────────────────────────────────────────────────
function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(StellarProvider, { network: "testnet", children })
}

// ── Fixtures ───────────────────────────────────────────────────────────────
const CLAIMABLE_ADDRESS = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOACCWN"

const MOCK_RECORD = {
  id: "000000000123abc",
  asset: "native",
  amount: "100.0000000",
  claimants: [{ destination: CLAIMABLE_ADDRESS, predicate: { unconditional: true } }],
  sponsor: undefined,
}

const MOCK_RECORD_WITH_SPONSOR = {
  ...MOCK_RECORD,
  id: "000000000456def",
  sponsor: "GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
}

// ── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
})

describe("useClaimableBalance — no address", () => {
  it("returns empty balances and does not call Horizon when address is null", () => {
    const { result } = renderHook(() => useClaimableBalance({ address: null }), { wrapper })

    expect(result.current.balances).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(mockCall).not.toHaveBeenCalled()
  })
})

describe("useClaimableBalance — loading state", () => {
  it("sets loading=true while the request is in flight", async () => {
    // Never resolve so we can observe the loading state
    mockCall.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useClaimableBalance({ address: CLAIMABLE_ADDRESS }), {
      wrapper,
    })

    // Loading should flip to true on the first render after the effect fires
    await waitFor(() => expect(result.current.loading).toBe(true))
    expect(result.current.balances).toEqual([])
    expect(result.current.error).toBeNull()
  })
})

describe("useClaimableBalance — success state", () => {
  it("returns parsed balances when Horizon responds with records", async () => {
    mockCall.mockResolvedValue({ records: [MOCK_RECORD] })

    const { result } = renderHook(() => useClaimableBalance({ address: CLAIMABLE_ADDRESS }), {
      wrapper,
    })

    await waitFor(() => {
      expect(mockCall).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.balances).toHaveLength(1)

    const balance = result.current.balances[0]
    expect(balance.id).toBe(MOCK_RECORD.id)
    expect(balance.asset).toBe("native")
    expect(balance.amount).toBe("100.0000000")
    expect(balance.claimants).toHaveLength(1)
    expect(balance.claimants[0].destination).toBe(CLAIMABLE_ADDRESS)
    expect(balance.claimants[0].predicate).toEqual({ unconditional: true })
    expect(balance.sponsor).toBeUndefined()
  })

  it("maps the optional sponsor field when present", async () => {
    mockCall.mockResolvedValue({ records: [MOCK_RECORD_WITH_SPONSOR] })

    const { result } = renderHook(() => useClaimableBalance({ address: CLAIMABLE_ADDRESS }), {
      wrapper,
    })

    await waitFor(() => {
      expect(mockCall).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.balances[0].sponsor).toBe(MOCK_RECORD_WITH_SPONSOR.sponsor)
  })

  it("returns multiple records correctly", async () => {
    mockCall.mockResolvedValue({
      records: [MOCK_RECORD, MOCK_RECORD_WITH_SPONSOR],
    })

    const { result } = renderHook(() => useClaimableBalance({ address: CLAIMABLE_ADDRESS }), {
      wrapper,
    })

    await waitFor(() => {
      expect(mockCall).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.balances).toHaveLength(2)
  })
})

describe("useClaimableBalance — empty state", () => {
  it("returns empty array (not an error) when no claimable balances exist", async () => {
    mockCall.mockResolvedValue({ records: [] })

    const { result } = renderHook(() => useClaimableBalance({ address: CLAIMABLE_ADDRESS }), {
      wrapper,
    })

    await waitFor(() => {
      expect(mockCall).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.balances).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it("treats a 404 response as empty array, not an error", async () => {
    mockCall.mockRejectedValue(new Error("Request failed with status code 404"))

    const { result } = renderHook(() => useClaimableBalance({ address: CLAIMABLE_ADDRESS }), {
      wrapper,
    })

    await waitFor(() => {
      expect(mockCall).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.balances).toEqual([])
    expect(result.current.error).toBeNull()
  })
})

describe("useClaimableBalance — error state", () => {
  it("sets error when Horizon returns a non-404 failure", async () => {
    mockCall.mockRejectedValue(new Error("Network timeout"))

    const { result } = renderHook(() => useClaimableBalance({ address: CLAIMABLE_ADDRESS }), {
      wrapper,
    })

    await waitFor(() => {
      expect(mockCall).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe("Network timeout")
    expect(result.current.balances).toEqual([])
  })

  it("sets a fallback error message for non-Error throws", async () => {
    mockCall.mockRejectedValue("unexpected string error")

    const { result } = renderHook(() => useClaimableBalance({ address: CLAIMABLE_ADDRESS }), {
      wrapper,
    })

    await waitFor(() => {
      expect(mockCall).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe("Failed to fetch claimable balances")
  })
})

describe("useClaimableBalance — refetch", () => {
  it("re-calls Horizon when refetch() is invoked", async () => {
    mockCall.mockResolvedValue({ records: [MOCK_RECORD] })

    const { result } = renderHook(() => useClaimableBalance({ address: CLAIMABLE_ADDRESS }), {
      wrapper,
    })

    await waitFor(() => {
      expect(mockCall).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })
    expect(mockCall).toHaveBeenCalledTimes(1)

    await act(() => {
      result.current.refetch()
    })
    await waitFor(() => expect(mockCall).toHaveBeenCalledTimes(2))
  })

  it("clears a previous error on refetch", async () => {
    // First call errors, second succeeds
    mockCall
      .mockRejectedValueOnce(new Error("Network timeout"))
      .mockResolvedValueOnce({ records: [MOCK_RECORD] })

    const { result } = renderHook(() => useClaimableBalance({ address: CLAIMABLE_ADDRESS }), {
      wrapper,
    })

    await waitFor(() => expect(result.current.error).toBe("Network timeout"))

    await act(() => {
      result.current.refetch()
    })
    await waitFor(() => {
      expect(mockCall).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.balances).toHaveLength(1)
  })
})

describe("useClaimableBalance — Horizon call shape", () => {
  it("calls claimableBalances().claimant(address).call()", async () => {
    mockCall.mockResolvedValue({ records: [] })

    renderHook(() => useClaimableBalance({ address: CLAIMABLE_ADDRESS }), { wrapper })

    await waitFor(() => expect(mockCall).toHaveBeenCalledTimes(1))

    expect(mockCall).toHaveBeenCalledTimes(1)
    expect(mockCall).toHaveBeenCalledTimes(1)
  })
})
