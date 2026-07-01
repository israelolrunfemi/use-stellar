import React from "react"
import { renderHook } from "@testing-library/react"
import { useSendPayment } from "./useSendPayment"
import { StellarProvider } from "../context/StellarProvider"
import type { ReactNode } from "react"
import type { WalletState } from "../types"

// Mock the Stellar SDK and Freighter API
jest.mock("@stellar/stellar-sdk")
jest.mock("@stellar/freighter-api")
jest.mock("../utils")

// Mock isBrowser to return true for these tests
jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  isBrowser: () => true,
}))

// Mock the context to inject wallet state
const mockSetWallet = jest.fn()
let mockWalletState: WalletState = {
  connected: false,
  address: null,
  network: null,
  wallet: null,
  connecting: false,
  error: null,
  walletNetwork: null,
}

jest.mock("../context/StellarProvider", () => {
  const actual = jest.requireActual("../context/StellarProvider")
  return {
    ...actual,
    useStellarContext: () => ({
      network: "testnet",
      networkConfig: {
        network: "testnet",
        horizonUrl: "https://horizon-testnet.stellar.org",
        sorobanUrl: "https://soroban-testnet.stellar.org",
      },
      wallet: mockWalletState,
      setWallet: mockSetWallet,
    }),
  }
})

function createWrapper(network: "testnet" | "mainnet" = "testnet") {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <StellarProvider network={network}>{children}</StellarProvider>
  }
}

describe("useSendPayment - Network Mismatch Protection", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockWalletState = {
      connected: false,
      address: null,
      network: null,
      wallet: null,
      connecting: false,
      error: null,
      walletNetwork: null,
    }
  })

  it("should throw error when wallet is not connected", async () => {
    mockWalletState = {
      connected: false,
      address: null,
      network: null,
      wallet: null,
      connecting: false,
      error: null,
      walletNetwork: null,
    }

    const { result } = renderHook(() => useSendPayment(), {
      wrapper: createWrapper("testnet"),
    })

    await expect(
      result.current.send({
        to: "GDEST",
        amount: "10",
        asset: "XLM",
      })
    ).rejects.toThrow("Wallet not connected")
  })

  it("should throw error when networks mismatch", async () => {
    mockWalletState = {
      connected: true,
      address: "GABC123",
      network: "testnet",
      wallet: "freighter",
      connecting: false,
      error: null,
      walletNetwork: "mainnet", // Mismatch: wallet on mainnet but provider on testnet
    }

    const { result } = renderHook(() => useSendPayment(), {
      wrapper: createWrapper("testnet"),
    })

    await expect(
      result.current.send({
        to: "GDEST",
        amount: "10",
        asset: "XLM",
      })
    ).rejects.toThrow("Network mismatch")
  })

  it("should proceed when networks match", async () => {
    mockWalletState = {
      connected: true,
      address: "GABC123",
      network: "testnet",
      wallet: "freighter",
      connecting: false,
      error: null,
      walletNetwork: "testnet", // Networks match
    }

    const { result } = renderHook(() => useSendPayment(), {
      wrapper: createWrapper("testnet"),
    })

    // This will fail due to mocked dependencies, but we're checking it doesn't fail on network mismatch
    await expect(
      result.current.send({
        to: "GDEST",
        amount: "10",
        asset: "XLM",
      })
    ).rejects.not.toThrow("Network mismatch")
  })

  it("should proceed when walletNetwork is null (legacy state)", async () => {
    mockWalletState = {
      connected: true,
      address: "GABC123",
      network: "testnet",
      wallet: "freighter",
      connecting: false,
      error: null,
      walletNetwork: null, // Legacy state without walletNetwork
    }

    const { result } = renderHook(() => useSendPayment(), {
      wrapper: createWrapper("testnet"),
    })

    // Should not throw network mismatch error when walletNetwork is null
    await expect(
      result.current.send({
        to: "GDEST",
        amount: "10",
        asset: "XLM",
      })
    ).rejects.not.toThrow("Network mismatch")
  })

  it("should include helpful message in network mismatch error", async () => {
    mockWalletState = {
      connected: true,
      address: "GABC123",
      network: "testnet",
      wallet: "freighter",
      connecting: false,
      error: null,
      walletNetwork: "mainnet",
    }

    const { result } = renderHook(() => useSendPayment(), {
      wrapper: createWrapper("testnet"),
    })

    try {
      await result.current.send({
        to: "GDEST",
        amount: "10",
        asset: "XLM",
      })
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      if (error instanceof Error) {
        expect(error.message).toContain("Provider is on testnet")
        expect(error.message).toContain("wallet is on mainnet")
        expect(error.message).toContain("refreshWalletNetwork()")
      }
    }
  })
})
