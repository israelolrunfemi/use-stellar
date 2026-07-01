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
import type { SendPaymentOptions, SendPaymentResult, Asset, StellarError } from "../types"
import { createStellarError, toStellarError } from "../errors"

export interface UseSendPaymentReturn {
  send: (options: SendPaymentOptions) => Promise<SendPaymentResult & { error?: string }>
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
  const { network, networkConfig, wallet } = useStellarContext()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<StellarError | null>(null)
  const [result, setResult] = useState<SendPaymentResult | null>(null)

  const send = useCallback(
    async (options: SendPaymentOptions): Promise<SendPaymentResult & { error?: string }> => {
      if (!wallet.connected || !wallet.address) {
        throw createStellarError(
          "WALLET_NOT_CONNECTED",
          "Wallet not connected. Call connect() first."
        )
      }
      if (!wallet.wallet) {
        throw new Error("No wallet adapter selected. Call connect() first.")
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
      setResult(null);

      try {
        const server = getHorizonServer(network)
        const sourceAcc = await server.loadAccount(wallet.address)
        const networkPassphrase = networkConfig.network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET

        const stellarAsset = toStellarAsset(options.asset)
        const operation = Operation.payment({
          destination: options.to,
          asset: stellarAsset,
          amount: options.amount,
        })

        const builder = new TransactionBuilder(sourceAcc, {
          fee: BASE_FEE,
          networkPassphrase,
        })
          .addOperation(operation)

        if (options.memo) {
          builder.addMemo(Memo.text(options.memo))
        }

        builder.setTimeout(30)
        const tx = builder.build()

        // Check if Freighter is installed
        const freighter = (window as any).freighter
        if (!freighter) {
          const stellarError = createStellarError(
            "WALLET_NOT_INSTALLED",
            "Freighter is not installed. Please install Freighter from https://www.freighter.app/"
          )
          setError(stellarError)
          throw stellarError
        }

        let signedTxXdr: string
        try {
          const signRes = await freighter.signTransaction(tx.toXDR(), { networkPassphrase })
          if (typeof signRes === "string") {
            signedTxXdr = signRes
          } else if (signRes && typeof signRes === "object") {
            if (signRes.error) {
              throw new Error(signRes.error.message || signRes.error)
            }
            signedTxXdr = signRes.signedTxXdr
          } else {
            throw new Error("Freighter did not return a signed transaction.")
          }
        } catch (signErr) {
          const errorMsg = signErr instanceof Error ? signErr.message : String(signErr)
          const stellarError = createStellarError("WALLET_REQUEST_REJECTED", errorMsg, { raw: signErr })
          setError(stellarError)
          const outcome: SendPaymentResult & { error: string } = {
            hash: "",
            status: "failed",
            error: errorMsg,
          }
          setResult(outcome)
          return outcome
        }

        const signed = TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase)
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
    [network, networkConfig, wallet]
  )

  const reset = useCallback(() => {
    setError(null)
    setResult(null)
  }, [])

  return { send, loading, error, result, reset }
}

function toStellarAsset(asset: Asset): StellarAsset {
  if (isNativeAsset(asset)) return StellarAsset.native()
  return new StellarAsset(asset.code, asset.issuer)
}

