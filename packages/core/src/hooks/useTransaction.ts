import { useState, useEffect, useRef, useCallback } from "react"
import { useStellarContext } from "../context/StellarProvider"
import { getHorizonServer } from "../utils"
import type { TransactionResult, TransactionStatus } from "../types"

export interface UseTransactionOptions {
  hash: string | null
  watch?: boolean // keep polling until success or failed
}

export interface UseTransactionReturn {
  transaction: TransactionResult | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Fetches the status and details of a specific transaction by hash.
 *
 * @param options - Configuration options
 * @param options.hash - The transaction hash to look up
 * @param options.watch - When true, keeps polling until the transaction succeeds or fails
 * @returns `{ transaction, loading, error, refetch }`
 *
 * @example
 * const { transaction } = useTransaction({ hash: "...", watch: true })
 */
export function useTransaction({
  hash,
  watch = false,
}: UseTransactionOptions): UseTransactionReturn {
  const { network } = useStellarContext()

  const [transaction, setTransaction] = useState<TransactionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const transactionRef = useRef<TransactionResult | null>(null)

  transactionRef.current = transaction

  const fetchTransaction = useCallback(async () => {
    if (!hash) {
      setTransaction(null)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const server = getHorizonServer(network)
      const raw = await server.transactions().transaction(hash).call()

      const status: TransactionStatus = raw.successful ? "success" : "failed"

      setTransaction({
        hash: raw.hash,
        status,
        ledger: Number(raw.ledger),
        createdAt: raw.created_at,
        fee: String(raw.fee_charged),
        envelope: raw.envelope_xdr,
      })
    } catch (err: unknown) {
      // 404 means not found / still pending
      const is404 = (err as { response?: { status: number } })?.response?.status === 404
      if (is404) {
        setTransaction({ hash: hash!, status: watch ? "pending" : "not_found" })
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch transaction")
      }
    } finally {
      setLoading(false)
    }
  }, [hash, network, watch])

  useEffect(() => {
    fetchTransaction()

    if (watch) {
      const interval = setInterval(() => {
        const status = transactionRef.current?.status
        if (status === "success" || status === "failed") return
        fetchTransaction()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [fetchTransaction, watch])

  return { transaction, loading, error, refetch: fetchTransaction }
}
