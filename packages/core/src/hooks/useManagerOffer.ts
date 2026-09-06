import { useState } from "react"
import { Operation, Asset as SdkAsset, TransactionBuilder } from "@stellar/stellar-sdk"
import { useStellarContext } from "../context/StellarProvider"
import { getHorizonServer, isNativeAsset } from "../utils"
import { getWalletAdapter } from "../wallets"
import { createStellarError, toStellarError } from "../errors"
import type { ManageOfferParams, UseManageOfferReturn, Asset, TransactionResult } from "../types"
import type { StellarError } from "../errors"

// Helper to convert library Asset to StellarSdk Asset
function toSdkAsset(asset: Asset): SdkAsset {
  if (isNativeAsset(asset)) return SdkAsset.native()
  return new SdkAsset(asset.code, asset.issuer)
}

// Compare assets
function assetsEqual(a: Asset, b: Asset): boolean {
  if (isNativeAsset(a) || isNativeAsset(b)) return isNativeAsset(a) && isNativeAsset(b)
  return a.code === b.code && a.issuer === b.issuer
}

// Validate positive numbers without float arithmetic
function isPositive(val: string | { n: number; d: number }): boolean {
  if (typeof val === "string") {
    const match = val.match(/^-?([0-9]*\.?[0-9]+)$/)
    if (!match || val.startsWith("-")) return false
    return match[1]
      .replace(".", "")
      .split("")
      .some(c => c !== "0")
  }
  return val.n > 0 && val.d > 0
}

export function useManageOffer(): UseManageOfferReturn {
  const { networkConfig, wallet } = useStellarContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<StellarError | null>(null)
  const [result, setResult] = useState<TransactionResult | null>(null)

  const execute = async (
    params: ManageOfferParams,
    offerId: string = "0",
    isCancel: boolean = false
  ): Promise<TransactionResult | null> => {
    if (!wallet.connected || !wallet.address || !wallet.wallet) {
      setError(createStellarError("WALLET_NOT_CONNECTED", undefined))
      return null
    }

    setLoading(true)
    setError(null)

    try {
      if (assetsEqual(params.selling, params.buying)) {
        throw createStellarError("VALIDATION_ERROR", "Selling and buying assets must be different")
      }

      if (!isCancel) {
        if (!isPositive(params.amount))
          throw createStellarError("VALIDATION_ERROR", "Amount must be positive")
        if (!isPositive(params.price))
          throw createStellarError("VALIDATION_ERROR", "Price must be positive")
      }

      if (isCancel && (!offerId || offerId === "0")) {
        throw createStellarError("VALIDATION_ERROR", "Missing offerId for cancellation")
      }

      const server = getHorizonServer(networkConfig)
      const sourceAccount = await server.loadAccount(wallet.address)

      const common = {
        selling: toSdkAsset(params.selling),
        buying: toSdkAsset(params.buying),
        price: params.price as string | number | { n: number; d: number },
        offerId,
      }

      const op =
        params.side === "buy"
          ? Operation.manageBuyOffer({ ...common, buyAmount: params.amount })
          : Operation.manageSellOffer({ ...common, amount: params.amount })

      const tx = new TransactionBuilder(sourceAccount, {
        fee: "100",
        networkPassphrase: networkConfig.networkPassphrase,
      })
        .addOperation(op)
        .setTimeout(30)
        .build()

      const adapter = getWalletAdapter(wallet.wallet)
      const signedXdr = await adapter.signTransaction(tx.toXDR(), {
        address: wallet.address,
        network: networkConfig.network,
        networkPassphrase: networkConfig.networkPassphrase,
      })
      const signed = TransactionBuilder.fromXDR(signedXdr, networkConfig.networkPassphrase)

      const res = await server.submitTransaction(signed)
      const txResult: TransactionResult = {
        hash: res.hash,
        status: res.successful ? "success" : "failed",
        ledger: res.ledger,
      }

      setResult(txResult)
      return txResult
    } catch (err: unknown) {
      let mappedErr: unknown = err
      const resultCodes =
        err && typeof err === "object"
          ? (
              err as {
                response?: { data?: { extras?: { result_codes?: { operations?: string[] } } } }
              }
            ).response?.data?.extras?.result_codes
          : undefined

      if (resultCodes?.operations?.includes("op_low_reserve")) {
        mappedErr = createStellarError("LOW_RESERVE", undefined)
      }

      setError(toStellarError(mappedErr))
      return null
    } finally {
      setLoading(false)
    }
  }

  const createOffer = async (o: ManageOfferParams) => execute(o, "0", false)

  const updateOffer = async (offerId: string, o: ManageOfferParams) => {
    if (!offerId || offerId === "0") {
      setError(createStellarError("VALIDATION_ERROR", "offerId is required for updateOffer"))
      return null
    }
    return execute(o, offerId, false)
  }

  const cancelOffer = async (offerId: string) => {
    if (!offerId || offerId === "0") {
      setError(createStellarError("VALIDATION_ERROR", "offerId is required for cancelOffer"))
      return null
    }

    if (!wallet.connected || !wallet.address || !wallet.wallet) {
      setError(createStellarError("WALLET_NOT_CONNECTED", undefined))
      return null
    }

    setLoading(true)
    setError(null)
    try {
      const server = getHorizonServer(networkConfig)
      // Look up the existing offer to get exactly matching assets to fulfill the API structure
      const offer = await server.offers().offer(offerId).call()

      const selling: Asset =
        offer.selling.asset_type === "native"
          ? "XLM"
          : { code: offer.selling.asset_code!, issuer: offer.selling.asset_issuer! }

      const buying: Asset =
        offer.buying.asset_type === "native"
          ? "XLM"
          : { code: offer.buying.asset_code!, issuer: offer.buying.asset_issuer! }

      return await execute(
        { selling, buying, amount: "0", price: offer.price_r, side: "sell" },
        offerId,
        true
      )
    } catch (err: unknown) {
      setError(toStellarError(err) ?? createStellarError("UNKNOWN", undefined))
      return null
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setError(null)
    setResult(null)
    setLoading(false)
  }

  return { createOffer, updateOffer, cancelOffer, loading, error, result, reset }
}
