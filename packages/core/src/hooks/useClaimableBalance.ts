import { useState, useEffect, useCallback } from "react"
import { useStellarContext } from "../context/StellarProvider"
import { getHorizonServer } from "../utils"
import type { ClaimableBalance } from "../types"

export interface UseClaimableBalanceOptions {
  address?: string | null // defaults to connected wallet address
}

export interface UseClaimableBalanceReturn {
  balances: ClaimableBalance[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useClaimableBalance({
  address,
}: UseClaimableBalanceOptions = {}): UseClaimableBalanceReturn {
  const { network, wallet } = useStellarContext()
  const resolvedAddress = address ?? wallet.address

  const [balances, setBalances] = useState<ClaimableBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalances = useCallback(async () => {
    if (!resolvedAddress) {
      setBalances([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const server = getHorizonServer(network)
      const result = await server.claimableBalances().claimant(resolvedAddress).call()

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
      // A 404 means the account has no claimable balances — treat as empty
      if (err instanceof Error && err.message.includes("404")) {
        setBalances([])
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch claimable balances")
      }
    } finally {
      setLoading(false)
    }
  }, [resolvedAddress, network])

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  return { balances, loading, error, refetch: fetchBalances }
}
