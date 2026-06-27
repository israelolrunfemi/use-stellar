import { renderHook, waitFor, act } from "@testing-library/react"
import React from "react"
import { StellarProvider } from "../context/StellarProvider"
import { useTransaction } from "./useTransaction"

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

// Mock transaction call function
const mockTransactionCall = jest.fn()

// Mock Horizon server instance
Object.assign(mockServer, {
  transactions: () => ({
    transaction: () => ({
      call: mockTransactionCall,
    }),
  }),
})

// Test wrapper
function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(StellarProvider, { network: "testnet", children })
}

const TEST_HASH = "abcdef1234567890"

// Mock data
const mockTransactionData = {
  hash: "abcdef1234567890",
  successful: true,
  ledger: 12345,
  created_at: "2024-01-01T00:00:00Z",
  fee_charged: "100",
}

describe("useTransaction", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTransactionCall.mockResolvedValue(mockTransactionData)
  })

  describe("null transaction hash", () => {
    it("should not perform request when hash is null", () => {
      const { result } = renderHook(() => useTransaction({ hash: null }), { wrapper })

      expect(result.current.loading).toBe(false)
      expect(result.current.transaction).toBe(null)
      expect(result.current.error).toBe(null)
    })

    it("should not perform request when hash is undefined", () => {
      const { result } = renderHook(
        () => useTransaction({ hash: undefined as unknown as string }),
        { wrapper }
      )

      expect(result.current.loading).toBe(false)
      expect(result.current.transaction).toBe(null)
      expect(result.current.error).toBe(null)
    })
  })

  describe("valid transaction hash", () => {
    it("should return transaction successfully", async () => {
      const { result } = renderHook(() => useTransaction({ hash: TEST_HASH }), { wrapper })

      await waitFor(() => {
        expect(mockTransactionCall).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(null)
      expect(result.current.transaction).toEqual({
        hash: "abcdef1234567890",
        status: "success",
        ledger: 12345,
        createdAt: "2024-01-01T00:00:00Z",
        fee: "100",
      })
    })

    it("should handle failed transactions correctly", async () => {
      mockTransactionCall.mockResolvedValue({
        ...mockTransactionData,
        successful: false,
      })

      const { result } = renderHook(() => useTransaction({ hash: TEST_HASH }), { wrapper })

      await waitFor(() => {
        expect(mockTransactionCall).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(null)
      expect(result.current.transaction?.status).toBe("failed")
    })
  })

  describe("404 not found", () => {
    it("should return not_found status when watch is false", async () => {
      mockTransactionCall.mockRejectedValue({ response: { status: 404 } })

      const { result } = renderHook(() => useTransaction({ hash: TEST_HASH, watch: false }), {
        wrapper,
      })

      await waitFor(() => {
        expect(mockTransactionCall).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(null)
      expect(result.current.transaction).toEqual({
        hash: TEST_HASH,
        status: "not_found",
      })
    })

    it("should return pending status when watch is true", async () => {
      mockTransactionCall.mockRejectedValue({ response: { status: 404 } })

      const { result } = renderHook(() => useTransaction({ hash: TEST_HASH, watch: true }), {
        wrapper,
      })

      await waitFor(() => {
        expect(mockTransactionCall).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(null)
      expect(result.current.transaction).toEqual({
        hash: TEST_HASH,
        status: "pending",
      })
    })
  })

  describe("unexpected server errors", () => {
    it("should handle network errors correctly", async () => {
      mockTransactionCall.mockRejectedValue(new Error("Network Error"))

      const { result } = renderHook(() => useTransaction({ hash: TEST_HASH }), { wrapper })

      await waitFor(() => {
        expect(mockTransactionCall).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.transaction).toBe(null)
      expect(result.current.error).toBe("Network Error")
    })

    it("should handle unknown errors correctly", async () => {
      mockTransactionCall.mockRejectedValue(new Error("Unknown server error"))

      const { result } = renderHook(() => useTransaction({ hash: TEST_HASH }), { wrapper })

      await waitFor(() => {
        expect(mockTransactionCall).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.transaction).toBe(null)
      expect(result.current.error).toBe("Unknown server error")
    })
  })

  describe("refetch functionality", () => {
    it("should provide working refetch function", async () => {
      const { result } = renderHook(() => useTransaction({ hash: TEST_HASH }), { wrapper })

      await waitFor(() => {
        expect(mockTransactionCall).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })

      // Verify initial success
      expect(result.current.transaction?.status).toBe("success")
      expect(result.current.error).toBe(null)

      // Mock an error for refetch
      mockTransactionCall.mockRejectedValue(new Error("Network Error"))

      // Call refetch
      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(mockTransactionCall).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.transaction?.status).toBe("success")
      expect(result.current.error).toBe("Network Error")
    })
  })
})
