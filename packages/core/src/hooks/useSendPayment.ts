import { useState, useCallback } from "react"
import {
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Operation,
  Asset as StellarAsset,
  Memo,
} from "@stellar/stellar-sdk"

import { useStellarContext } from "../context/StellarProvider"
import { getHorizonServer, isNativeAsset, isBrowser } from "../utils"
import { createStellarError, toStellarError } from "../errors"
import type { SendPaymentOptions, SendPaymentResult, Asset, StellarError } from "../types"

export interface UseSendPaymentReturn {
  send: (options: SendPaymentOptions) => Promise<SendPaymentResult>
  loading: boolean
  error: StellarError | null
  result: SendPaymentResult | null
  reset: () => void
}

/**
 * Builds, signs, and submits a payment transaction to the Stellar network.
 *
 * @returns `{ send, loading, error, result, reset }`
 *
 * @example
 * const { send, loading } = useSendPayment()
 * await send({ to: "G...", asset: "XLM", amount: "10" })
 */
export function useSendPayment(): UseSendPaymentReturn {
  const { network, wallet } = useStellarContext()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<StellarError | null>(null)
  const [result, setResult] = useState<SendPaymentResult | null>(null)

  const send = useCallback(
    async (options: SendPaymentOptions): Promise<SendPaymentResult> => {
      if (!wallet.connected || !wallet.address) {
        throw createStellarError(
          "WALLET_NOT_CONNECTED",
          "Wallet not connected. Call connect() first."
        )
      }

      if (!isBrowser()) {
        throw createStellarError(
          "VALIDATION_ERROR",
          "Transaction signing is only available in the browser. " +
            'Move your component to a "use client" boundary in Next.js / Remix.'
        )
      }

      // Check for network mismatch
      if (wallet.walletNetwork && wallet.network !== wallet.walletNetwork) {
        throw new Error(
          `Network mismatch: Provider is on ${wallet.network} but wallet is on ${wallet.walletNetwork}. ` +
          `Switch your wallet to ${wallet.network} or call refreshWalletNetwork() to update.`
        );
      }

      setLoading(true);
      setError(null);

      try {
        const server = getHorizonServer(network)
        const sourceAcc = await server.loadAccount(wallet.address)
        const networkPass = network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET

        // ── Build the operation ──────────────────────────────────────────
        const stellarAsset = toStellarAsset(options.asset)
        const operation = Operation.payment({
          destination: options.to,
          asset: stellarAsset,
          amount: options.amount,
        })

        // ── Build the transaction ────────────────────────────────────────
        const builder = new TransactionBuilder(sourceAcc, {
          fee: BASE_FEE,
          networkPassphrase: networkPass,
        })
          .addOperation(operation)
          .setTimeout(30)

        if (options.memo) {
          builder.addMemo(Memo.text(options.memo))
        }

        const tx = builder.build()
        const xdr = tx.toXDR()

        // ── Sign with Freighter ──────────────────────────────────────────
        // Dynamic import keeps @stellar/freighter-api out of the SSR bundle.
        const { signTransaction } = await import("@stellar/freighter-api")
        const signedTransaction = await signTransaction(xdr, {
          networkPassphrase: networkPass,
          address: wallet.address,
        })
        if (signedTransaction.error) {
          throw new Error(signedTransaction.error.message)
        }
        if (!signedTransaction.signedTxXdr) {
          throw new Error("Freighter did not return a signed transaction.")
        }

        // ── Submit ───────────────────────────────────────────────────────
        const signed = TransactionBuilder.fromXDR(signedTransaction.signedTxXdr, networkPass)
        const res = await server.submitTransaction(signed)

        const outcome: SendPaymentResult = {
          hash: res.hash,
          status: "success",
        }

        setResult(outcome)
        return outcome
      } catch (err) {
        const stellarError = toStellarError(err)
        setError(stellarError)
        throw stellarError
      } finally {
        setLoading(false)
      }
    },
    [network, wallet]
  )

  const reset = useCallback(() => {
    setError(null)
    setResult(null)
  }, [])

  return { send, loading, error, result, reset }
}

// ── Convert our Asset type to Stellar SDK Asset ────────────────────────────
function toStellarAsset(asset: Asset): StellarAsset {
  if (isNativeAsset(asset)) return StellarAsset.native()
  return new StellarAsset(asset.code, asset.issuer)
}
