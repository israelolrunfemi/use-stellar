import { useState, useEffect, useCallback, useRef } from "react"
import { useStellarContext } from "../context/StellarProvider"
import { getHorizonServer, parseHorizonBalance } from "../utils"
import { toStellarError } from "../errors"
import type { Asset, Balance, StellarError } from "../types"

// Default polling interval (ms) used when `watch` is enabled without an explicit
// `interval`.
const DEFAULT_WATCH_INTERVAL = 10_000

export interface UseBalanceOptions {
  address?: string | null // defaults to connected wallet address
  asset?: Asset // defaults to XLM
  watch?: boolean // auto re-fetch on an interval (default false)
  interval?: number // polling interval in ms when watch is true (default 10000)
}

export interface UseBalanceReturn {
  balance: string | null
  balances: Balance[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null // timestamp of the last successful fetch
  error: StellarError | null
  refetch: () => void
}

/**
 * Fetches the XLM or asset balance for the connected wallet or any Stellar address.
 *
 * @param options - Configuration options
 * @param options.address - The Stellar address to fetch balances for. Defaults to the connected wallet.
 * @param options.asset - The asset to return in `balance`. Defaults to XLM.
 * @param options.watch - When true, re-fetches on an interval (default false).
 * @param options.interval - Polling interval in ms when `watch` is true (default 10000).
 * @returns `{ balance, balances, loading, error, lastUpdated, refetch }`
 *
 * @example
 * const { balance, loading } = useBalance({ asset: "XLM", watch: true, interval: 5000 })
 */
export function useBalance({
  address,
  asset = "XLM",
  watch = false,
  interval = DEFAULT_WATCH_INTERVAL,
}: UseBalanceOptions = {}): UseBalanceReturn {
  const { network, wallet } = useStellarContext()
  const resolvedAddress = address ?? wallet.address

  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<StellarError | null>(null)

  // Monotonic id used to ignore stale responses (e.g. when the address/network
  // changes mid-flight, or the component unmounts before a fetch resolves).
  const requestRef = useRef(0)

  const fetchBalances = useCallback(async () => {
    if (!resolvedAddress) return

    const fetchId = ++requestRef.current
    setLoading(true)
    setError(null)

    try {
      const server = getHorizonServer(network)
      const account = await server.loadAccount(resolvedAddress)
      const parsed = account.balances.map(parseHorizonBalance)

      if (fetchId !== requestRef.current) return

      setBalances(parsed)
      setLastUpdated(new Date())
    } catch (err) {
      if (fetchId !== requestRef.current) return
      setError(toStellarError(err))
    } finally {
      if (fetchId === requestRef.current) {
        setLoading(false)
      }
    }
  }, [resolvedAddress, network])

  useEffect(() => {
    fetchBalances()

    // Guard against non-positive intervals that would busy-loop setInterval.
    const ms = interval > 0 ? interval : DEFAULT_WATCH_INTERVAL
    const id = watch ? setInterval(fetchBalances, ms) : null

    return () => {
      if (id) clearInterval(id)
      // Cancel any in-flight request so a late response can't update an
      // unmounted component or a stale watch cycle.
      requestRef.current = -1
    }
  }, [fetchBalances, watch, interval])

  // Find the specific asset balance
  const match = balances.find(b => {
    if (asset === "XLM") return b.asset === "XLM"
    if (typeof asset === "object" && typeof b.asset === "object") {
      return b.asset.code === asset.code && b.asset.issuer === asset.issuer
    }
    return false
  })
  const balance = match?.balance ?? null

  return {
    balance,
    balances,
    loading,
    error,
    lastUpdated,
    refetch: fetchBalances,
  }
}
