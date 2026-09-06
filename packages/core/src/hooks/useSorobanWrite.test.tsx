// packages/core/src/hooks/useSorobanWrite.test.tsx

import { renderHook, act } from "@testing-library/react"
import { useSorobanWrite } from "./useSorobanWrite"
import { rpc, xdr, TransactionBuilder, Networks } from "@stellar/stellar-sdk"
import { useStellarContext } from "../context/StellarProvider"
import { getHorizonServer, isBrowser } from "../utils"
import { getWalletAdapter } from "../wallets"

jest.mock("../context/StellarProvider")
jest.mock("../utils")
jest.mock("../wallets")

const mockSimulateTransaction = jest.fn()
const mockSendTransaction = jest.fn()
const mockGetTransaction = jest.fn()
const mockAssembleTransaction = jest.fn()

jest.mock("@stellar/stellar-sdk", () => {
  const original = jest.requireActual("@stellar/stellar-sdk")
  return {
    ...original,
    rpc: {
      ...original.rpc,
      Server: jest.fn().mockImplementation(() => ({
        simulateTransaction: mockSimulateTransaction,
        sendTransaction: mockSendTransaction,
        getTransaction: mockGetTransaction,
      })),
      assembleTransaction: (...args: unknown[]) => mockAssembleTransaction(...args),
    },
  }
})

describe("useSorobanWrite", () => {
  const mockWallet = {
    connected: true,
    address: "GCL2KR4CDAZU3SECOM4CNJGBDYHWYD7UZ6OJMPRXZJM7TFPXHQZM4PRI",
    wallet: "test-wallet",
    walletNetwork: "testnet",
  }

  const mockNetworkConfig = {
    network: "testnet",
    sorobanUrl: "https://soroban-testnet.stellar.org",
    horizonUrl: "https://horizon-testnet.stellar.org",
    networkPassphrase: Networks.TESTNET,
  }

  const mockSignTransaction = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(isBrowser as jest.Mock).mockReturnValue(true)
    ;(useStellarContext as jest.Mock).mockReturnValue({
      network: "testnet",
      networkConfig: mockNetworkConfig,
      wallet: mockWallet,
    })
    ;(getHorizonServer as jest.Mock).mockReturnValue({
      loadAccount: jest.fn().mockResolvedValue({ sequence: "123" }),
    })
    ;(getWalletAdapter as jest.Mock).mockReturnValue({
      signTransaction: mockSignTransaction,
    })

    const mockAssembledTx = {
      toXDR: () => "mock-xdr",
    }
    mockAssembleTransaction.mockReturnValue({
      build: () => mockAssembledTx,
    })

    mockSignTransaction.mockResolvedValue("mock-signed-xdr")

    jest.spyOn(TransactionBuilder, "fromXDR").mockReturnValue({
      toXDR: () => "mock-signed-xdr",
    } as unknown as ReturnType<typeof TransactionBuilder.fromXDR>)
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it("completes full simulate -> assemble -> sign -> send -> poll flow", async () => {
    mockSimulateTransaction.mockResolvedValue({
      transactionData: new xdr.SorobanTransactionData({
        resources: new xdr.SorobanResources({
          footprint: new xdr.LedgerFootprint({ readOnly: [], readWrite: [] }),
          instructions: 0,
          readBytes: 0,
          writeBytes: 0,
        }),
        resourceFee: xdr.Int64.fromString("100"),
        ext: new (xdr.ExtensionPoint as unknown as { new (switch_: number): xdr.ExtensionPoint })(
          0
        ),
      }),
      minResourceFee: "100",
      events: [],
      results: [
        {
          xdr: xdr.ScVal.scvI32(42).toXDR("base64"),
        },
      ],
    })

    jest.spyOn(rpc.Api, "isSimulationSuccess").mockReturnValue(true)
    jest.spyOn(rpc.Api, "isSimulationError").mockReturnValue(false)
    jest.spyOn(rpc.Api, "isSimulationRestore").mockReturnValue(false)

    mockSendTransaction.mockResolvedValue({
      status: "PENDING",
      hash: "mock-hash",
    })

    mockGetTransaction
      .mockResolvedValueOnce({
        status: "PENDING" as unknown as rpc.Api.GetTransactionStatus,
      })
      .mockResolvedValueOnce({
        status: rpc.Api.GetTransactionStatus.SUCCESS,
        returnValue: xdr.ScVal.scvI32(42),
      })

    const { result } = renderHook(() => useSorobanWrite<number>())

    let invokeResult: { hash: string; result: number } | undefined
    await act(async () => {
      invokeResult = await result.current.invoke({
        contractId: "CAVCUKRKFIVCUKRKFIVCUKRKFIVCUKRKFIVCUKRKFIVCUKRKFIVCVLQ3",
        method: "add",
        args: [xdr.ScVal.scvI32(1), xdr.ScVal.scvI32(2)],
      })
    })

    expect(mockAssembleTransaction).toHaveBeenCalled()
    expect(mockSignTransaction).toHaveBeenCalled()
    expect(mockSendTransaction).toHaveBeenCalled()
    expect(mockGetTransaction).toHaveBeenCalledWith("mock-hash")
    expect(invokeResult?.hash).toBe("mock-hash")
    expect(invokeResult?.result).toBe(42) // Safely decoded via scValToNative
  })

  it("surfaces RESTORE_PREAMBLE_REQUIRED error for archived state", async () => {
    jest.spyOn(rpc.Api, "isSimulationError").mockReturnValue(false)
    jest.spyOn(rpc.Api, "isSimulationRestore").mockReturnValue(true)

    const { result } = renderHook(() => useSorobanWrite())

    await act(async () => {
      await expect(
        result.current.invoke({
          contractId: "CAVCUKRKFIVCUKRKFIVCUKRKFIVCUKRKFIVCUKRKFIVCUKRKFIVCVLQ3",
          method: "add",
        })
      ).rejects.toThrow(/archived/)
    })

    expect(result.current.error?.code).toBe("RESTORE_PREAMBLE_REQUIRED")
  })

  it("surfaces TX_TIMEOUT on poll timeout and attaches the hash", async () => {
    jest.spyOn(rpc.Api, "isSimulationSuccess").mockReturnValue(true)
    jest.spyOn(rpc.Api, "isSimulationError").mockReturnValue(false)
    jest.spyOn(rpc.Api, "isSimulationRestore").mockReturnValue(false)

    mockSendTransaction.mockResolvedValue({
      status: "PENDING",
      hash: "mock-hash-timeout",
    })

    mockGetTransaction.mockResolvedValue({
      status: "PENDING" as unknown as rpc.Api.GetTransactionStatus,
    })

    const { result } = renderHook(() => useSorobanWrite())

    await act(async () => {
      await expect(
        result.current.invoke({
          contractId: "CAVCUKRKFIVCUKRKFIVCUKRKFIVCUKRKFIVCUKRKFIVCUKRKFIVCVLQ3",
          method: "add",
          timeout: 100,
        })
      ).rejects.toThrow(/timed out/)
    })

    expect(result.current.error?.code).toBe("TX_TIMEOUT")
    expect(result.current.error?.hash).toBe("mock-hash-timeout")
  })

  it("fails early if wallet is not connected", async () => {
    ;(useStellarContext as jest.Mock).mockReturnValue({
      network: "testnet",
      networkConfig: mockNetworkConfig,
      wallet: { ...mockWallet, connected: false },
    })

    const { result } = renderHook(() => useSorobanWrite())

    await act(async () => {
      await expect(
        result.current.invoke({
          contractId: "CAVCUKRKFIVCUKRKFIVCUKRKFIVCUKRKFIVCUKRKFIVCUKRKFIVCVLQ3",
          method: "add",
        })
      ).rejects.toThrow(/connected/)
    })
  })
})
