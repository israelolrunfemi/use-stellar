import { useState, useCallback } from "react"
import {
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Operation,
  Asset as StellarAsset,
  Memo,
} from "@stellar/stellar-sdk";
import freighterApi from "@stellar/freighter-api";

const { signTransaction } =
  typeof freighterApi.signTransaction === "function"
    ? freighterApi
    : (freighterApi as any).default;
import { useStellarContext } from "../context/StellarProvider";
import { getHorizonServer, isNativeAsset, isBrowser } from "../utils";
import type { SendPaymentOptions, SendPaymentResult, Asset } from "../types";

export interface UseSendPaymentReturn {
  send: (options: SendPaymentOptions) => Promise<SendPaymentResult>
  loading: boolean
  error: string | null
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
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SendPaymentResult | null>(null)

  const send = useCallback(
    async (options: SendPaymentOptions): Promise<SendPaymentResult> => {
      if (!wallet.connected || !wallet.address) {
        throw new Error("Wallet not connected. Call connect() first.")
      }

      if (!isBrowser()) {
        throw new Error(
          "Transaction signing is only available in the browser. " +
          "Move your component to a \"use client\" boundary in Next.js / Remix."
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

        // ── Sign & submit ────────────────────────────────────────────────
        let txHash: string

        if (wallet.wallet === "albedo") {
          // Albedo signs and submits in one shot via albedo.pay()
          const albedoNetwork = network === "mainnet" ? "public" : "testnet"
          const payParams: Parameters<typeof albedo.pay>[0] = {
            amount: options.amount,
            destination: options.to,
            network: albedoNetwork,
            submit: true,
          }

          if (!isNativeAsset(options.asset)) {
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
          // Default: Freighter signs, we submit manually
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
        const tx  = builder.build();
        const xdr = tx.toXDR();

        // ── Sign with Freighter ──────────────────────────────────────────
        // Dynamic import keeps @stellar/freighter-api out of the SSR bundle.
        const { signTransaction } = await import("@stellar/freighter-api");
        const signedTransaction = await signTransaction(xdr, {
          networkPassphrase: networkPass,
          address: wallet.address,
        });
        if (signedTransaction.error) {
          throw new Error(signedTransaction.error.message);
        }
        if (!signedTransaction.signedTxXdr) {
          throw new Error("Freighter did not return a signed transaction.");
        }

        const outcome: SendPaymentResult = {
          hash: txHash,
          status: "success",
        }

        setResult(outcome)
        return outcome
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transaction failed"
        setError(message)
        throw new Error(message)
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
