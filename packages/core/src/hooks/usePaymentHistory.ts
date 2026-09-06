import { useMemo } from "react"
import { usePayments } from "./usePayments"
import type { UsePaymentHistoryOptions, UsePaymentHistoryReturn } from "../types"
import { isNativeAsset, isIssuedAsset } from "../utils"

export function usePaymentHistory({
  address,
  limit = 10,
  order = "desc",
  cursor,
  direction = "all",
  asset = "all",
}: UsePaymentHistoryOptions = {}): UsePaymentHistoryReturn {
  const {
    payments: rawPayments,
    loading,
    error,
    refetch,
    fetchNext: fetchNextPage,
    fetchPrev: fetchPrevPage,
    hasNext: hasNextPage,
    hasPrev,
  } = usePayments({ address, limit, order, cursor })

  const filteredPayments = useMemo(() => {
    let newFilteredPayments = rawPayments

    // Filter by direction
    if (direction !== "all") {
      newFilteredPayments = newFilteredPayments.filter(p => p.direction === direction)
    }

    // Filter by asset
    if (asset !== "all") {
      newFilteredPayments = newFilteredPayments.filter(p => {
        if (isNativeAsset(asset) && isNativeAsset(p.asset)) {
          return true
        }
        if (isIssuedAsset(asset) && isIssuedAsset(p.asset)) {
          return asset.code === p.asset.code && asset.issuer === p.asset.issuer
        }
        return false
      })
    }

    return newFilteredPayments
  }, [rawPayments, direction, asset])

  // If the filtered list is empty but the underlying fetch says there's a
  // next page, the "Next" button would be misleading. We adjust `hasNext`
  // to be false in this case, preventing an infinite loop of fetching empty
  // filtered pages.
  const hasNext = filteredPayments.length > 0 && hasNextPage

  return {
    payments: filteredPayments,
    loading,
    error,
    refetch,
    fetchNext: fetchNextPage,
    fetchPrev: fetchPrevPage,
    hasNext,
    hasPrev,
  }
}
