import { useState, useEffect, useCallback, useRef } from "react"
import { useStellarContext } from "../context/StellarProvider"
import type { ContractCallOptions } from "../types"

export interface UseSorobanContractReturn {
  data: unknown | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Calls a method on a Soroban smart contract.
 *
 * @param options - Configuration options
 * @param options.contractId - The ID of the Soroban contract
 * @param options.method - The method to call on the contract
 * @param options.args - Optional arguments for the contract method
 * @returns `{ data, loading, error, refetch }`
 *
 * @example
 * const { data, loading } = useSorobanContract({ contractId: "C...", method: "increment" })
 */
export function useSorobanContract({
  contractId,
  method,
}: ContractCallOptions): UseSorobanContractReturn {
  const { networkConfig } = useStellarContext()

  const [data, setData] = useState<unknown | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestRef = useRef(0)

  const callContract = useCallback(async () => {
    const fetchId = ++requestRef.current
    setLoading(true)
    setError(null)

    try {
      if (!contractId || !method) {
        if (fetchId !== requestRef.current) return
        setData(null)
        return
      }

      if (fetchId !== requestRef.current) return

      setData({
        contractId,
        method,
        network: networkConfig.network,
        note: "Simulation wiring tracked in issue #10",
      })
    } catch (err) {
      if (fetchId !== requestRef.current) return
      setError(err instanceof Error ? err.message : "Contract call failed")
    } finally {
      if (fetchId === requestRef.current) {
        setLoading(false)
      }
    }
  }, [contractId, method, networkConfig])

  useEffect(() => {
    callContract()
    return () => {
      requestRef.current = -1
    }
  }, [callContract])

  return { data, loading, error, refetch: callContract }
}
