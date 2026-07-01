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
import { getHorizonServer, isNativeAsset, isIssuedAsset, isBrowser } from "../utils"
import { getWalletAdapter } from "../wallets"
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

      try {
        const server = getHorizonServer(network)
        const sourceAcc = await server.loadAccount(wallet.address)
        const networkPass = network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET

        const stellarAsset = toStellarAsset(options.asset)
        const operation = Operation.payment({
          destination: options.to,
          asset: stellarAsset,
          amount: options.amount,
        })

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

        // ── Sign & submit ────────────────────────────────────────────────
        let txHash: string

        if (wallet.wallet === "albedo") {
          // Dynamic import keeps @albedo-link/intent out of the SSR/test bundle
          const albedoModule = await import("@albedo-link/intent")
          const albedo = albedoModule.default ?? albedoModule
          const albedoNetwork = network === "mainnet" ? "public" : "testnet"
          const payParams: Parameters<typeof albedo.pay>[0] = {
            amount: options.amount,
            destination: options.to,
            network: albedoNetwork,
            submit: true,
          }

          if (!isNativeAsset(options.asset) && isIssuedAsset(options.asset)) {
            payParams.asset_code = options.asset.code
            payParams.asset_issuer = options.asset.issuer
          }

          if (options.memo) {
            payParams.memo = options.memo
            payParams.memo_type = "text"
          }

          const albedoResult = await albedo.pay(payParams)
          txHash = albedoResult.tx_hash
        } else {
          // Default: Freighter — dynamic import keeps it out of the SSR bundle
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

          const signed = TransactionBuilder.fromXDR(signedTransaction.signedTxXdr, networkPass)
          const res = await server.submitTransaction(signed)
          txHash = res.hash
        }
        const adapter = getWalletAdapter(wallet.wallet)
        const signedTxXdr = await adapter.signTransaction(xdr, {
          address: wallet.address,
          network,
          networkPassphrase: networkPass,
        })

        const signed = TransactionBuilder.fromXDR(signedTxXdr, networkPass)
        const res = await server.submitTransaction(signed)

        const outcome: SendPaymentResult = {
          hash: txHash,
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

function toStellarAsset(asset: Asset): StellarAsset {
  if (isNativeAsset(asset)) return StellarAsset.native()
  if (isIssuedAsset(asset)) return new StellarAsset(asset.code, asset.issuer)
  return StellarAsset.native() // fallback for liquidity_pool_shares
}
