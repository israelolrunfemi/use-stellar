import { useState, useEffect, useCallback, useRef } from "react"
import { useStellarContext } from "../context/StellarProvider"
import { getHorizonServer } from "../utils"
import type {
  UsePaymentsOptions,
  UsePaymentsReturn,
  NormalizedPayment,
  Asset,
  StellarError,
} from "../types"
import type { Horizon } from "@stellar/stellar-sdk"
import { toStellarError } from "../errors"

type PaymentRecord =
  | Horizon.ServerApi.PaymentOperationRecord
  | Horizon.ServerApi.CreateAccountOperationRecord
  | Horizon.ServerApi.AccountMergeOperationRecord
  | Horizon.ServerApi.PathPaymentOperationRecord
  | Horizon.ServerApi.PathPaymentStrictSendOperationRecord
  | Horizon.ServerApi.InvokeHostFunctionOperationRecord

/**
 * Fetches an account's payment operations with pagination.
 *
 * Follows a stale-while-revalidate contract: a failed fetch never clears
 * `payments` — it only sets `error` and flips `isStale`, so the consumer can
 * keep rendering the last known-good payments.
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
 * const { payments, fetchNext } = usePayments({ address: "G..." })
 */
export function usePayments({
  address,
  limit = 10,
  order = "desc",
  cursor,
}: UsePaymentsOptions = {}): UsePaymentsReturn {
  const { network, networkConfig, wallet } = useStellarContext()
  const resolvedAddress = address ?? wallet.address

  const [payments, setPayments] = useState<NormalizedPayment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<StellarError | null>(null)

  // Store page navigation functions from the Horizon response
  const nextRef = useRef<(() => Promise<Horizon.ServerApi.CollectionPage<PaymentRecord>>) | null>(
    null
  )
  const prevRef = useRef<(() => Promise<Horizon.ServerApi.CollectionPage<PaymentRecord>>) | null>(
    null
  )

  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  // Monotonic id shared by fetchPayments/fetchNext/fetchPrev — whichever of
  // the three started most recently owns the state writes below, so a
  // slower, superseded response (from any of the three) is discarded.
  // Distinct from unmount cancellation below — a superseded fetch is
  // discarded because a newer fetch owns the state, while a cancelled fetch
  // is discarded because there is no component left to update.
  const requestRef = useRef(0)
  // Set only by the effect cleanup on unmount. Reset at the top of the
  // effect so it doesn't leak across re-runs.
  const cancelledRef = useRef(false)

  const fetchPayments = useCallback(async () => {
    if (!resolvedAddress) {
      setPayments([])
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
        .payments()
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
      const normalized = (
        await Promise.all(records.map(rec => normalizePayment(rec, resolvedAddress, server)))
      ).flat()

      if (cancelledRef.current || fetchId !== requestRef.current) return
      setPayments(normalized)

      // Save pagination callbacks. On the initial fetch a page with zero
      // records means there is genuinely nothing to navigate — leave the
      // refs null so fetchNext/fetchPrev are no-ops. During navigation the
      // refs are instead updated independently of the record count so that
      // landing on an empty page never loses the ability to navigate.
      nextRef.current = res.records.length > 0 ? () => res.next() : null
      prevRef.current = res.records.length > 0 ? () => res.prev() : null

      setHasNext(hasNextPage)
      setHasPrev(!!cursor)
    } catch (err) {
      if (cancelledRef.current || fetchId !== requestRef.current) return
      // Stale-while-revalidate: a failed fetch keeps the last known-good
      // payments in place and only surfaces the error.
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
      const server = getHorizonServer(networkConfig)
      const res = await nextRef.current()

      if (cancelledRef.current || fetchId !== requestRef.current) return

      const hasNextPage = res.records.length > limit
      const records = hasNextPage ? res.records.slice(0, limit) : res.records
      const normalized = (
        await Promise.all(records.map(rec => normalizePayment(rec, resolvedAddress!, server)))
      ).flat()

      if (cancelledRef.current || fetchId !== requestRef.current) return

      // Update cursor refs independently of record count so that landing on
      // an empty page never loses the ability to navigate back.
      nextRef.current = () => res.next()
      prevRef.current = () => res.prev()

      if (normalized.length > 0) {
        // Normal case: render the new page.
        setPayments(normalized)
      }
      // Empty-page UX: if zero records came back, keep the current page
      // displayed and just reflect the updated navigation state.
      setHasNext(hasNextPage)
      setHasPrev(true)
    } catch (err) {
      if (cancelledRef.current || fetchId !== requestRef.current) return
      // Stale-while-revalidate: a failed fetch keeps the last known-good
      // payments in place and only surfaces the error.
      setError(toStellarError(err))
    } finally {
      if (!cancelledRef.current && fetchId === requestRef.current) {
        setLoading(false)
      }
    }
  }, [resolvedAddress, networkConfig, limit])

  const fetchPrev = useCallback(async () => {
    if (!prevRef.current) return
    const fetchId = ++requestRef.current
    setLoading(true)
    setError(null)
    try {
      const server = getHorizonServer(networkConfig)
      const res = await prevRef.current()

      if (cancelledRef.current || fetchId !== requestRef.current) return

      // Request limit+1 for prev too so hasPrev is symmetrically accurate.
      const hasPrevPage = res.records.length > limit
      const records = hasPrevPage ? res.records.slice(0, limit) : res.records
      const normalized = (
        await Promise.all(records.map(rec => normalizePayment(rec, resolvedAddress!, server)))
      ).flat()

      if (cancelledRef.current || fetchId !== requestRef.current) return

      // Update cursor refs independently of record count.
      nextRef.current = () => res.next()
      prevRef.current = () => res.prev()

      if (normalized.length > 0) {
        setPayments(normalized)
      }
      setHasPrev(hasPrevPage)
      setHasNext(true)
    } catch (err) {
      if (cancelledRef.current || fetchId !== requestRef.current) return
      // Stale-while-revalidate: a failed fetch keeps the last known-good
      // payments in place and only surfaces the error.
      setError(toStellarError(err))
    } finally {
      if (!cancelledRef.current && fetchId === requestRef.current) {
        setLoading(false)
      }
    }
  }, [resolvedAddress, networkConfig, limit])

  // Clear stale data synchronously the moment the query changes (address or
  // network), before the new fetch resolves — otherwise there's a window
  // where the previous account's payments render under the new query.
  // The pagination refs are dropped too (regression #225): a fetchNext from
  // the old query must not reach the old page's Horizon callbacks.
  // Refetches (including fetchNext/fetchPrev) must NOT hit this: they keep
  // the old data in place until the new fetch settles, per
  // stale-while-revalidate.
  useEffect(() => {
    nextRef.current = null
    prevRef.current = null
    setPayments([])
    setHasNext(false)
    setHasPrev(false)
    setError(null)
  }, [resolvedAddress, network])

  useEffect(() => {
    cancelledRef.current = false
    fetchPayments()
    return () => {
      cancelledRef.current = true
    }
  }, [fetchPayments])

  const isStale = error !== null && payments.length > 0

  return {
    payments,
    loading,
    error,
    isStale,
    refetch: fetchPayments,
    fetchNext,
    fetchPrev,
    hasNext,
    hasPrev,
  }
}

// ── Normalize Payment Operations ───────────────────────────────────────────
async function normalizePayment(
  record: PaymentRecord,
  address: string,
  server: Horizon.Server
): Promise<NormalizedPayment[]> {
  const type = record.type
  const id = record.id
  const txHash = record.transaction_hash
  const createdAt = record.created_at

  if (
    type === "payment" ||
    type === "create_account" ||
    type === "path_payment_strict_receive" ||
    type === "path_payment_strict_send"
  ) {
    let from = ""
    let to = ""
    let amount = "0"
    let asset: Asset = "XLM"
    let direction: "incoming" | "outgoing" = "outgoing"

    if (type === "payment") {
      from = record.from
      to = record.to
      amount = record.amount
      asset =
        record.asset_type === "native"
          ? "XLM"
          : { code: record.asset_code!, issuer: record.asset_issuer! }
      direction = to === address ? "incoming" : "outgoing"
    } else if (type === "create_account") {
      from = record.funder
      to = record.account
      amount = record.starting_balance
      asset = "XLM"
      direction = to === address ? "incoming" : "outgoing"
    } else if (type === "path_payment_strict_receive" || type === "path_payment_strict_send") {
      from = record.from
      to = record.to
      direction = to === address ? "incoming" : "outgoing"

      if (direction === "incoming") {
        amount = record.amount
        asset =
          record.asset_type === "native"
            ? "XLM"
            : { code: record.asset_code!, issuer: record.asset_issuer! }
      } else {
        amount = record.source_amount || record.amount
        const srcAssetType = record.source_asset_type || record.asset_type
        asset =
          srcAssetType === "native"
            ? "XLM"
            : {
                code: record.source_asset_code || record.asset_code!,
                issuer: record.source_asset_issuer || record.asset_issuer!,
              }
      }
    }

    return [{ id, txHash, type, from, to, amount, asset, direction, createdAt }]
  }

  if (type === "account_merge") {
    // The merge operation itself does not carry a balance change; the amount
    // lives on the account effects of the source account. Fetch them to
    // resolve the true merged amount instead of fabricating one.
    const effects = await server.effects().forOperation(record.id).call()
    const mergeEffect = effects.records.find(
      eff =>
        (eff.type === "account_debited" || eff.type === "account_credited") &&
        "account" in eff &&
        eff.account === address
    )

    if (!mergeEffect || !("amount" in mergeEffect)) return []

    return [
      {
        id,
        txHash,
        type,
        from: mergeEffect.account,
        to: record.into,
        amount: mergeEffect.amount,
        asset: "XLM",
        direction: record.into === address ? "incoming" : "outgoing",
        createdAt,
      },
    ]
  }

  if (type === "invoke_host_function") {
    const changes = record.asset_balance_changes ?? []

    return changes
      .filter(change => change.from === address || change.to === address)
      .map(change => ({
        id,
        txHash,
        type,
        from: change.from,
        to: change.to,
        amount: change.amount,
        asset:
          change.asset_type === "native"
            ? "XLM"
            : { code: change.asset_code!, issuer: change.asset_issuer! },
        direction: change.to === address ? "incoming" : "outgoing",
        createdAt,
      }))
  }

  // Unhandled operation type: filter it out rather than fabricating a payment.
  return []
}
