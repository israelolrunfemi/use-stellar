// packages/core/src/hooks/useSorobanWrite.ts

import { useState, useCallback } from "react"
import { useStellarContext } from "../context/StellarProvider"
import { getHorizonServer, isBrowser } from "../utils"
import { getWalletAdapter } from "../wallets"
import { rpc, Contract, TransactionBuilder, scValToNative, Account } from "@stellar/stellar-sdk"
import { toStellarError, createStellarError } from "../errors"
import type { SorobanInvokeOptions, UseSorobanWriteReturn } from "../types"
import type { StellarError } from "../errors"

export function useSorobanWrite<T = unknown>(): UseSorobanWriteReturn<T> {
  const { network, networkConfig, wallet } = useStellarContext()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<StellarError | null>(null)
  const [result, setResult] = useState<{ hash: string; result: T } | null>(null)

  const invoke = useCallback(
    async (options: SorobanInvokeOptions) => {
      setLoading(true)
      setError(null)
      setResult(null)

      try {
        if (!isBrowser()) throw new Error("Window is not defined")
        if (!wallet.connected || !wallet.address || !wallet.wallet) {
          const err = new Error("Wallet not connected")
          err.name = "WALLET_NOT_CONNECTED"
          throw err
        }
        if (wallet.walletNetwork && wallet.walletNetwork !== network) {
          const err = new Error("Network mismatch")
          err.name = "NETWORK_MISMATCH"
          throw err
        }

        const { contractId, method, args = [], fee, timeout = 30000 } = options

        const server = new rpc.Server(networkConfig.sorobanUrl)
        const horizon = getHorizonServer(networkConfig)

        const accountInfo = await horizon.loadAccount(wallet.address)
        const account = new Account(wallet.address, accountInfo.sequence)

        const contract = new Contract(contractId)

        // 1. Build initial tx for simulation
        const tx = new TransactionBuilder(account, {
          fee: fee || "100", // Inclusion fee
          networkPassphrase: networkConfig.networkPassphrase,
        })
          .addOperation(contract.call(method, ...args))
          .setTimeout(Math.floor(timeout / 1000) || 30)
          .build()

        // 2. Simulate transaction
        const simResult = await server.simulateTransaction(tx)

        if (rpc.Api.isSimulationError(simResult)) {
          const err = new Error(simResult.error)
          err.name = "SIMULATION_FAILED"
          throw err
        }

        if (rpc.Api.isSimulationRestore(simResult)) {
          const err = new Error(
            "Contract state is archived. A restorePreamble transaction is required before invoking this method."
          )
          err.name = "RESTORE_PREAMBLE_REQUIRED"
          throw err
        }

        if (!rpc.Api.isSimulationSuccess(simResult)) {
          const err = new Error("Simulation failed for an unknown reason")
          err.name = "SIMULATION_FAILED"
          throw err
        }

        // 3. Assemble: applies footprint and merges the simulation's minResourceFee
        const assembledTx = rpc.assembleTransaction(tx, simResult).build()

        const adapter = getWalletAdapter(wallet.wallet)
        if (!adapter) {
          const err = new Error(`Wallet adapter not found: ${wallet.wallet}`)
          err.name = "WALLET_NOT_FOUND"
          throw err
        }

        // 4. Sign
        const signedXdr = await adapter.signTransaction(assembledTx.toXDR(), {
          address: wallet.address!,
          network: networkConfig.network,
          networkPassphrase: networkConfig.networkPassphrase,
        })
        const signedTx = TransactionBuilder.fromXDR(signedXdr, networkConfig.networkPassphrase)

        // 5. Send & Poll
        const sendResult = await server.sendTransaction(signedTx)

        if (sendResult.errorResult) {
          const err = new Error("Transaction submission failed")
          err.name = "TX_FAILED"
          throw err
        }

        const txHash = sendResult.hash
        const startTime = Date.now()
        let txStatus: rpc.Api.GetTransactionResponse = await server.getTransaction(txHash)
        const deadline = startTime + timeout

        while (Date.now() < deadline) {
          if (
            txStatus.status === rpc.Api.GetTransactionStatus.SUCCESS ||
            txStatus.status === rpc.Api.GetTransactionStatus.FAILED
          ) {
            break
          }

          await new Promise(resolve => setTimeout(resolve, 2000))
          txStatus = await server.getTransaction(txHash)
        }

        if (
          txStatus.status !== rpc.Api.GetTransactionStatus.SUCCESS &&
          txStatus.status !== rpc.Api.GetTransactionStatus.FAILED
        ) {
          const err = new Error(`Transaction polling timed out after ${timeout}ms`)
          err.name = "TX_TIMEOUT"
          ;(err as Error & { hash?: string }).hash = txHash
          throw err
        }

        if (txStatus.status === rpc.Api.GetTransactionStatus.FAILED) {
          const err = new Error(`Transaction failed on-chain: ${txStatus.resultXdr}`)
          err.name = "TX_FAILED"
          throw err
        }

        let decodedResult: unknown
        const returnValue = (txStatus as rpc.Api.GetSuccessfulTransactionResponse).returnValue

        if (returnValue) {
          try {
            decodedResult = scValToNative(returnValue)
          } catch {
            decodedResult = returnValue // Fallback to raw XDR
          }
        }

        const finalResult = {
          hash: txHash,
          result: decodedResult as T,
        }

        setResult(finalResult)
        return finalResult
      } catch (err: unknown) {
        const hash =
          err && typeof err === "object" && "hash" in err
            ? (err as { hash?: unknown }).hash
            : undefined
        const stellarError = toStellarError(err)
        const finalError =
          stellarError && typeof hash === "string"
            ? createStellarError(stellarError.code, stellarError.message, {
                raw: stellarError.raw,
                hash,
              })
            : stellarError
        setError(finalError)
        throw finalError
      } finally {
        setLoading(false)
      }
    },
    [network, networkConfig, wallet]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setResult(null)
  }, [])

  return {
    invoke,
    loading,
    error,
    result,
    reset,
  }
}
