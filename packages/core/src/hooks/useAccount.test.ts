import { renderHook, waitFor, act } from "@testing-library/react"
import React from "react"
import { StellarProvider } from "../context/StellarProvider"
import { useAccount } from "./useAccount"

// Mock the entire @stellar/stellar-sdk module
jest.mock("@stellar/stellar-sdk", () => ({
  Horizon: {
    Server: jest.fn(),
  },
}))

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

// Mock Horizon server instance
Object.assign(mockServer, {
  loadAccount: jest.fn(),
})

// Test wrapper
function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(StellarProvider, { network: "testnet", children })
}

const TEST_ADDRESS = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOACCWN"

// Mock data
const mockAccountData = {
  id: TEST_ADDRESS,
  sequenceNumber: () => "1234567890123456",
  subentry_count: 2,
  thresholds: {
    low_threshold: 1,
    med_threshold: 2,
    high_threshold: 3,
  },
  signers: [
    {
      key: TEST_ADDRESS,
      weight: 1,
      type: "ed25519_public_key",
    },
  ],
  balances: [
    {
      asset_type: "native",
      balance: "100.0000000",
    },
    {
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      balance: "250.5000000",
      limit: "1000.0000000",
    },
    {
      asset_type: "liquidity_pool_shares",
      balance: "50.0000000",
      liquidity_pool_id: "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7",
    },
  ],
}

describe("useAccount", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockServer.loadAccount.mockResolvedValue(mockAccountData)
  })

  describe("loading state", () => {
    it("should start in loading state when address is provided", async () => {
      const { result } = renderHook(() => useAccount({ address: TEST_ADDRESS }), { wrapper })

      expect(result.current.loading).toBe(true)
      expect(result.current.account).toBe(null)
      expect(result.current.error).toBe(null)
    })

    it("should not load when no address is provided", () => {
      const { result } = renderHook(() => useAccount({ address: null }), { wrapper })

      expect(result.current.loading).toBe(false)
      expect(result.current.account).toBe(null)
      expect(result.current.error).toBe(null)
    })
  })

  describe("successful account retrieval", () => {
    it("should fetch account info successfully", async () => {
      const { result } = renderHook(() => useAccount({ address: TEST_ADDRESS }), { wrapper })

      await waitFor(() => {
        expect(mockServer.loadAccount).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(null)
      expect(result.current.account).toEqual({
        address: TEST_ADDRESS,
        sequence: "1234567890123456",
        balances: [
          {
            asset: "XLM",
            balance: "100.0000000",
          },
          {
            asset: {
              code: "USDC",
              issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
            },
            balance: "250.5000000",
            limit: "1000.0000000",
          },
          {
            asset: "liquidity_pool_shares",
            balance: "50.0000000",
            liquidityPoolId: "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7",
          },
        ],
        subentryCount: 2,
        thresholds: {
          lowThreshold: 1,
          medThreshold: 2,
          highThreshold: 3,
        },
        signers: [
          {
            key: TEST_ADDRESS,
            weight: 1,
            type: "ed25519_public_key",
          },
        ],
      })
    })
  })

  describe("error state", () => {
    it("should handle account not found error", async () => {
      mockServer.loadAccount.mockRejectedValue(new Error("Request failed with status code 404"))

      const { result } = renderHook(() => useAccount({ address: TEST_ADDRESS }), { wrapper })

      await waitFor(() => {
        expect(mockServer.loadAccount).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.account).toBe(null)
      expect(result.current.error).toBe("Request failed with status code 404")
    })

    it("should handle network errors", async () => {
      mockServer.loadAccount.mockRejectedValue(new Error("Network Error"))

      const { result } = renderHook(() => useAccount({ address: TEST_ADDRESS }), { wrapper })

      await waitFor(() => {
        expect(mockServer.loadAccount).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.account).toBe(null)
      expect(result.current.error).toBe("Network Error")
    })
  })

  describe("state transitions", () => {
    it("should transition from loading to success correctly", async () => {
      const { result } = renderHook(() => useAccount({ address: TEST_ADDRESS }), { wrapper })

      // Initial loading state
      expect(result.current.loading).toBe(true)
      expect(result.current.account).toBe(null)
      expect(result.current.error).toBe(null)

      // Wait for completion
      await waitFor(() => {
        expect(mockServer.loadAccount).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })

      // Success state
      expect(result.current.loading).toBe(false)
      expect(result.current.account).toBeTruthy()
      expect(result.current.error).toBe(null)
    })

    it("should transition from loading to error correctly", async () => {
      mockServer.loadAccount.mockRejectedValue(new Error("Request failed with status code 404"))

      const { result } = renderHook(() => useAccount({ address: TEST_ADDRESS }), { wrapper })

      // Initial loading state
      expect(result.current.loading).toBe(true)
      expect(result.current.account).toBe(null)
      expect(result.current.error).toBe(null)

      // Wait for completion
      await waitFor(() => {
        expect(mockServer.loadAccount).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })

      // Error state
      expect(result.current.loading).toBe(false)
      expect(result.current.account).toBe(null)
      expect(result.current.error).toBeTruthy()
    })
  })

  describe("refetch functionality", () => {
    it("should provide working refetch function", async () => {
      const { result } = renderHook(() => useAccount({ address: TEST_ADDRESS }), { wrapper })

      await waitFor(() => {
        expect(mockServer.loadAccount).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })

      // Verify initial success
      expect(result.current.account).toBeTruthy()
      expect(result.current.error).toBe(null)

      // Mock an error for refetch
      mockServer.loadAccount.mockRejectedValue(new Error("Network Error"))

      // Call refetch
      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(mockServer.loadAccount).toHaveBeenCalledTimes(2)
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.account?.sequence).toBe("1234567890123456")
      expect(result.current.error).toBe("Network Error")
    })
  })
})
