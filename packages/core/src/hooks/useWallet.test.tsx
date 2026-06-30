import React from "react"
import { renderHook, act } from "@testing-library/react"
import { useWallet } from "./useWallet"
import { StellarProvider } from "../context/StellarProvider"
import type { ReactNode } from "react"
import * as freighterApi from "@stellar/freighter-api"

// Mock the Freighter API
jest.mock("@stellar/freighter-api")

// Mock isBrowser to return true for these tests
jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  isBrowser: () => true,
}))

const mockedFreighter = freighterApi as jest.Mocked<typeof freighterApi>

// Wrapper component
function createWrapper(network: "testnet" | "mainnet" = "testnet") {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <StellarProvider network={network}>{children}</StellarProvider>
  }
}

describe("useWallet - Network Sync", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("connect", () => {
    it("should capture wallet network on successful connection", async () => {
      mockedFreighter.isConnected.mockResolvedValue({
        isConnected: true,
        error: undefined,
      })
      mockedFreighter.requestAccess.mockResolvedValue({
        address: "GABC123",
        error: undefined,
      })
      mockedFreighter.getNetworkDetails.mockResolvedValue({
        networkPassphrase: "Test SDF Network ; September 2015",
        error: undefined,
        network: "testnet",
        networkUrl: "",
      })

      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper("testnet"),
      })

      await act(async () => {
        await result.current.connect("freighter")
      })

      expect(result.current.connected).toBe(true)
      expect(result.current.walletNetwork).toBe("testnet")
      expect(result.current.isNetworkMismatch).toBe(false)
    })

    it("should detect network mismatch on connection", async () => {
      mockedFreighter.isConnected.mockResolvedValue({
        isConnected: true,
        error: undefined,
      })
      mockedFreighter.requestAccess.mockResolvedValue({
        address: "GABC123",
        error: undefined,
      })
      // Wallet is on mainnet but provider expects testnet
      mockedFreighter.getNetworkDetails.mockResolvedValue({
        networkPassphrase: "Public Global Stellar Network ; September 2015",
        error: undefined,
        network: "mainnet",
        networkUrl: "",
      })

      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper("testnet"),
      })

      await act(async () => {
        try {
          await result.current.connect("freighter")
        } catch {
          // Expected to throw
        }
      })

      expect(result.current.connected).toBe(false)
      expect(result.current.error).toContain("Wrong network")
    })
  })

  describe("refreshWalletNetwork", () => {
    it("should update wallet network state", async () => {
      // Initial connection
      mockedFreighter.isConnected.mockResolvedValue({
        isConnected: true,
        error: undefined,
      })
      mockedFreighter.requestAccess.mockResolvedValue({
        address: "GABC123",
        error: undefined,
      })
      mockedFreighter.getNetworkDetails.mockResolvedValue({
        networkPassphrase: "Test SDF Network ; September 2015",
        error: undefined,
        network: "testnet",
        networkUrl: "",
      })

      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper("testnet"),
      })

      await act(async () => {
        await result.current.connect("freighter")
      })

      expect(result.current.walletNetwork).toBe("testnet")

      // Simulate wallet network change
      mockedFreighter.getNetworkDetails.mockResolvedValue({
        networkPassphrase: "Public Global Stellar Network ; September 2015",
        error: undefined,
        network: "mainnet",
        networkUrl: "",
      })

      await act(async () => {
        await result.current.refreshWalletNetwork()
      })

      expect(result.current.walletNetwork).toBe("mainnet")
    })

    it("should do nothing if wallet is not connected", async () => {
      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper("testnet"),
      })

      await act(async () => {
        await result.current.refreshWalletNetwork()
      })

      expect(mockedFreighter.getNetworkDetails).not.toHaveBeenCalled()
    })

    it("should handle errors gracefully", async () => {
      // Initial connection
      mockedFreighter.isConnected.mockResolvedValue({
        isConnected: true,
        error: undefined,
      })
      mockedFreighter.requestAccess.mockResolvedValue({
        address: "GABC123",
        error: undefined,
      })
      mockedFreighter.getNetworkDetails.mockResolvedValue({
        networkPassphrase: "Test SDF Network ; September 2015",
        error: undefined,
        network: "testnet",
        networkUrl: "",
      })

      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper("testnet"),
      })

      await act(async () => {
        await result.current.connect("freighter")
      })

      // Simulate error on refresh by returning an invalid passphrase
      mockedFreighter.getNetworkDetails.mockResolvedValue({
        networkPassphrase: "Invalid Passphrase",
        error: undefined,
        network: "",
        networkUrl: "",
      })

      await act(async () => {
        await result.current.refreshWalletNetwork()
      })

      // Should have an error since the passphrase doesn't match known networks
      expect(result.current.error).toBeTruthy()
      expect(result.current.error).toContain("Unknown network passphrase")
    })
  })

  describe("isNetworkMismatch", () => {
    it("should return false when networks match", async () => {
      mockedFreighter.isConnected.mockResolvedValue({
        isConnected: true,
        error: undefined,
      })
      mockedFreighter.requestAccess.mockResolvedValue({
        address: "GABC123",
        error: undefined,
      })
      mockedFreighter.getNetworkDetails.mockResolvedValue({
        networkPassphrase: "Test SDF Network ; September 2015",
        error: undefined,
        network: "testnet",
        networkUrl: "",
      })

      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper("testnet"),
      })

      await act(async () => {
        await result.current.connect("freighter")
      })

      expect(result.current.isNetworkMismatch).toBe(false)
    })

    it("should return true when networks mismatch after refresh", async () => {
      mockedFreighter.isConnected.mockResolvedValue({
        isConnected: true,
        error: undefined,
      })
      mockedFreighter.requestAccess.mockResolvedValue({
        address: "GABC123",
        error: undefined,
      })
      mockedFreighter.getNetworkDetails.mockResolvedValue({
        networkPassphrase: "Test SDF Network ; September 2015",
        error: undefined,
        network: "testnet",
        networkUrl: "",
      })

      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper("testnet"),
      })

      await act(async () => {
        await result.current.connect("freighter")
      })

      // User switches network in wallet
      mockedFreighter.getNetworkDetails.mockResolvedValue({
        networkPassphrase: "Public Global Stellar Network ; September 2015",
        error: undefined,
        network: "mainnet",
        networkUrl: "",
      })

      await act(async () => {
        await result.current.refreshWalletNetwork()
      })

      expect(result.current.isNetworkMismatch).toBe(true)
    })

    it("should return false when not connected", () => {
      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper("testnet"),
      })

      expect(result.current.isNetworkMismatch).toBe(false)
    })
  })

  describe("disconnect", () => {
    it("should clear wallet network state", async () => {
      mockedFreighter.isConnected.mockResolvedValue({
        isConnected: true,
        error: undefined,
      })
      mockedFreighter.requestAccess.mockResolvedValue({
        address: "GABC123",
        error: undefined,
      })
      mockedFreighter.getNetworkDetails.mockResolvedValue({
        networkPassphrase: "Test SDF Network ; September 2015",
        error: undefined,
        network: "testnet",
        networkUrl: "",
      })

      const { result } = renderHook(() => useWallet(), {
        wrapper: createWrapper("testnet"),
      })

      await act(async () => {
        await result.current.connect("freighter")
      })

      expect(result.current.walletNetwork).toBe("testnet")

      act(() => {
        result.current.disconnect()
      })

      expect(result.current.connected).toBe(false)
      expect(result.current.walletNetwork).toBe(null)
      expect(result.current.isNetworkMismatch).toBe(false)
    })
  })
})
