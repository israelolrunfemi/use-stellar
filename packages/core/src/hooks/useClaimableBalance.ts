import { useState, useEffect, useCallback, useRef } from "react"
import { useStellarContext } from "../context/StellarProvider"
import { getHorizonServer } from "../utils"
import { toStellarError } from "../errors"
import type { ClaimableBalance, StellarError } from "../types"

export interface UseClaimableBalanceOptions {
  address?: string | null // defaults to connected wallet address
}

export interface UseClaimableBalanceReturn {
  balances: ClaimableBalance[]
  loading: boolean
  error: StellarError | null
  refetch: () => void
}

export function useClaimableBalance({
  address,
}: UseClaimableBalanceOptions = {}): UseClaimableBalanceReturn {
  const { network, wallet } = useStellarContext()
  const resolvedAddress = address ?? wallet.address

  const [balances, setBalances] = useState<ClaimableBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<StellarError | null>(null)

  const requestRef = useRef(0)

  const fetchBalances = useCallback(async () => {
    if (!resolvedAddress) {
      setBalances([])
      return
    }

    const fetchId = ++requestRef.current
    setLoading(true)
    setError(null)

    try {
      const server = getHorizonServer(network)
      const result = await server.claimableBalances().claimant(resolvedAddress).call()

      if (fetchId !== requestRef.current) return

      const parsed: ClaimableBalance[] = result.records.map(record => ({
        id: record.id,
        asset: record.asset,
        amount: record.amount,
        claimants: record.claimants.map(c => ({
          destination: c.destination,
          predicate: c.predicate as object,
        })),
        sponsor: record.sponsor,
      }))

      setBalances(parsed)
    } catch (err) {
      if (fetchId !== requestRef.current) return
      const stellarError = toStellarError(err)
      // A 404 means the account has no claimable balances — treat as empty
      if (stellarError.code === "ACCOUNT_NOT_FOUND") {
        setBalances([])
      } else {
        setError(stellarError)
      }
    } finally {
      if (fetchId === requestRef.current) {
        setLoading(false)
      }
    }
  }, [resolvedAddress, network])

  useEffect(() => {
    fetchBalances()
    return () => {
      requestRef.current = -1
    }
  }, [fetchBalances])

  return { balances, loading, error, refetch: fetchBalances }
}
