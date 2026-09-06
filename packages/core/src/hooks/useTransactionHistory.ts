import { useState, useEffect, useCallback, useRef } from "react"
import { useStellarContext } from "../context/StellarProvider"
import { getHorizonServer } from "../utils"
import type {
  UseTransactionHistoryOptions,
  UseTransactionHistoryReturn,
  NormalizedTransaction,
  StellarError,
} from "../types"
import type { Horizon } from "@stellar/stellar-sdk"
import { toStellarError } from "../errors"

type TransactionRecord = Horizon.ServerApi.TransactionRecord
type TransactionPage = Horizon.ServerApi.CollectionPage<TransactionRecord>

/**
 * Fetches an account's transaction history with pagination.
 *
 * ### Pagination heuristic
 * Internally this hook requests `limit + 1` records from Horizon on every
 * fetch. If the response contains more than `limit` records a further page
 * exists (`hasNext === true` / `hasPrev === true`); only the first `limit`
 * records are exposed to callers. This avoids the off-by-one error of the
 * naïve `records.length >= limit` test, which incorrectly reports
 * `hasNext: true` when the account's total record count is an exact multiple
 * of the page size.
 *
 * ### Empty-page behaviour
 * When `fetchNext` or `fetchPrev` lands on a page that contains zero records
 * (possible if records are deleted between pages), the hook **keeps the
 * previously displayed page** and only updates the navigation state. The
 * cursor refs are updated independently of the record count so that
 * navigation back via `fetchPrev` / `fetchNext` always remains available
 * whenever Horizon provides the corresponding cursor.
 *
 * @example
 * const { transactions, fetchNext } = useTransactionHistory({ address: "G..." })
 */
export function useTransactionHistory({
  address,
  limit = 10,
  order = "desc",
  cursor,
}: UseTransactionHistoryOptions = {}): UseTransactionHistoryReturn {
  const { network, networkConfig, wallet } = useStellarContext()
  const resolvedAddress = address ?? wallet.address

  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<StellarError | null>(null)

  // Store page navigation functions from the Horizon response
  const nextRef = useRef<(() => Promise<TransactionPage>) | null>(null)
  const prevRef = useRef<(() => Promise<TransactionPage>) | null>(null)

  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  // Monotonic id shared by fetchTransactions/fetchNext/fetchPrev — whichever
  // of the three started most recently owns the state writes below, so a
  // slower, superseded response (from any of the three) is discarded.
  // Distinct from unmount cancellation below — a superseded fetch is
  // discarded because a newer fetch owns the state, while a cancelled fetch
  // is discarded because there is no component left to update.
  const requestRef = useRef(0)
  // Set only by the effect cleanup on unmount. Reset at the top of the
  // effect so it doesn't leak across re-runs.
  const cancelledRef = useRef(false)

  const fetchTransactions = useCallback(async () => {
    if (!resolvedAddress) {
      setTransactions([])
      setHasNext(false)
      setHasPrev(false)
      setLoading(false)
      setError(null)
      return
    }

    const fetchId = ++requestRef.current
    setLoading(true)
    setError(null)

    try {
      const server = getHorizonServer(networkConfig)
      // Request limit+1 to detect whether a further page exists without
      // relying on the record-count >= limit heuristic.
      let query = server
        .transactions()
        .forAccount(resolvedAddress)
        .limit(limit + 1)
        .order(order)
      if (cursor) {
        query = query.cursor(cursor)
      }

      const res = await query.call()

      if (cancelledRef.current || fetchId !== requestRef.current) return

      const hasNextPage = res.records.length > limit
      const records = hasNextPage ? res.records.slice(0, limit) : res.records
      const normalized = records.map(normalizeTransaction)

      if (cancelledRef.current || fetchId !== requestRef.current) return
      setTransactions(normalized)

      // Save pagination callbacks. On the initial fetch a page with zero
      // records means there is genuinely nothing to navigate — leave the
      // refs null so fetchNext/fetchPrev are no-ops.
      nextRef.current = res.records.length > 0 ? () => res.next() : null
      prevRef.current = res.records.length > 0 ? () => res.prev() : null

      setHasNext(hasNextPage)
      setHasPrev(!!cursor)
    } catch (err) {
      if (cancelledRef.current || fetchId !== requestRef.current) return
      setError(toStellarError(err))
    } finally {
      if (!cancelledRef.current && fetchId === requestRef.current) {
        setLoading(false)
      }
    }
  }, [resolvedAddress, networkConfig, limit, order, cursor])

  const fetchNext = useCallback(async () => {
    if (!nextRef.current) return
    const fetchId = ++requestRef.current
    setLoading(true)
    setError(null)
    try {
      const res = await nextRef.current()

      if (cancelledRef.current || fetchId !== requestRef.current) return

      const hasNextPage = res.records.length > limit
      const records = hasNextPage ? res.records.slice(0, limit) : res.records
      const normalized = records.map(normalizeTransaction)

      if (cancelledRef.current || fetchId !== requestRef.current) return

      // Update cursor refs independently of record count so that landing on
      // an empty page never loses the ability to navigate back.
      nextRef.current = () => res.next()
      prevRef.current = () => res.prev()

      if (normalized.length > 0) {
        // Normal case: render the new page.
        setTransactions(normalized)
      }
      // Empty-page UX: if zero records came back, keep the current page
      // displayed and just reflect the updated navigation state.
      setHasNext(hasNextPage)
      setHasPrev(true)
    } catch (err) {
      if (cancelledRef.current || fetchId !== requestRef.current) return
      setError(toStellarError(err))
    } finally {
      if (!cancelledRef.current && fetchId === requestRef.current) {
        setLoading(false)
      }
    }
  }, [limit])

  const fetchPrev = useCallback(async () => {
    if (!prevRef.current) return
    const fetchId = ++requestRef.current
    setLoading(true)
    setError(null)
    try {
      const res = await prevRef.current()

      if (cancelledRef.current || fetchId !== requestRef.current) return

      // Request limit+1 for prev too so hasPrev is symmetrically accurate.
      const hasPrevPage = res.records.length > limit
      const records = hasPrevPage ? res.records.slice(0, limit) : res.records
      const normalized = records.map(normalizeTransaction)

      if (cancelledRef.current || fetchId !== requestRef.current) return

      // Update cursor refs independently of record count.
      nextRef.current = () => res.next()
      prevRef.current = () => res.prev()

      if (normalized.length > 0) {
        setTransactions(normalized)
      }
      setHasPrev(hasPrevPage)
      setHasNext(true)
    } catch (err) {
      if (cancelledRef.current || fetchId !== requestRef.current) return
      setError(toStellarError(err))
    } finally {
      if (!cancelledRef.current && fetchId === requestRef.current) {
        setLoading(false)
      }
    }
  }, [limit])

  // Clear stale data synchronously the moment the query changes (address or
  // network), before the new fetch resolves — otherwise there's a window
  // where the previous account's transactions render under the new query.
  // The pagination refs are dropped too (regression #225): a fetchNext from
  // the old query must not reach the old page's Horizon callbacks.
  // Refetches (including fetchNext/fetchPrev) must NOT hit this: they keep
  // the old data in place until the new fetch settles.
  useEffect(() => {
    nextRef.current = null
    prevRef.current = null
    setTransactions([])
    setHasNext(false)
    setHasPrev(false)
    setError(null)
  }, [resolvedAddress, network])

  useEffect(() => {
    cancelledRef.current = false
    fetchTransactions()
    return () => {
      cancelledRef.current = true
    }
  }, [fetchTransactions])

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    fetchNext,
    fetchPrev,
    hasNext,
    hasPrev,
  }
}

// ── Normalize Transaction Records ──────────────────────────────────────────
function normalizeTransaction(record: TransactionRecord): NormalizedTransaction {
  return {
    hash: record.hash,
    ledger: Number(record.ledger),
    createdAt: record.created_at,
    sourceAccount: record.source_account,
    fee: String(record.fee_charged),
    operationCount: record.operation_count,
    successful: record.successful,
    memo: record.memo,
    memoType: record.memo_type,
  }
}
