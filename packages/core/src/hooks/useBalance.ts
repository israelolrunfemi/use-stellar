import { useState, useEffect, useCallback, useRef } from "react"
import { useStellarContext } from "../context/StellarProvider"
import { getHorizonServer, parseHorizonBalance } from "../utils"
import { toStellarError } from "../errors"
import type { Asset, Balance, StellarError } from "../types"

export interface UseBalanceOptions {
  address?: string | null // defaults to connected wallet address
  asset?: Asset // defaults to XLM
  watch?: boolean // re-fetch every 10s
}

export interface UseBalanceReturn {
  balance: string | null
  balances: Balance[]
  loading: boolean
  error: StellarError | null
  refetch: () => void
}

/**
 * Fetches the XLM or asset balance for the connected wallet or any Stellar address.
 *
 * @param options - Configuration options
 * @param options.address - The Stellar address to fetch balances for. Defaults to the connected wallet.
 * @param options.asset - The asset to return in `balance`. Defaults to XLM.
 * @param options.watch - When true, re-fetches every 10 seconds.
 * @returns `{ balance, balances, loading, error, refetch }`
 *
 * @example
 * const { balance, loading } = useBalance({ asset: "XLM", watch: true })
 */
export function useBalance({
  address,
  asset = "XLM",
  watch = false,
}: UseBalanceOptions = {}): UseBalanceReturn {
  const { network, wallet } = useStellarContext()
  const resolvedAddress = address ?? wallet.address

  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<StellarError | null>(null)

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

    const interval = watch ? setInterval(fetchBalances, 10_000) : null

    return () => {
      if (interval) {
        clearInterval(interval)
      }
      requestRef.current = -1
    }
  }, [fetchBalances, watch])

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
    refetch: fetchBalances,
  }
}
