import { useState, useEffect, useCallback, useRef } from "react"
import { useStellarContext } from "../context/StellarProvider"
import { getHorizonServer } from "../utils"

export interface AssetInfo {
  code: string
  issuer: string
  supply: string
  homeDomain?: string
  numAccounts: number
  flags: {
    authRequired: boolean
    authRevocable: boolean
    authImmutable: boolean
  }
}

export interface UseAssetOptions {
  code: string
  issuer: string
}

export interface UseAssetReturn {
  asset: AssetInfo | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Fetches details about a specific asset on the Stellar network.
 *
 * @param options - Configuration options
 * @param options.code - The asset code (e.g., "USDC")
 * @param options.issuer - The asset issuer's Stellar address
 * @returns `{ asset, loading, error, refetch }`
 *
 * @example
 * const { asset, loading } = useAsset({ code: "USDC", issuer: "G..." })
 */
export function useAsset({ code, issuer }: UseAssetOptions): UseAssetReturn {
  const { network } = useStellarContext()

  const [asset, setAsset] = useState<AssetInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestRef = useRef(0)

  const fetchAsset = useCallback(async () => {
    const fetchId = ++requestRef.current
    setLoading(true)
    setError(null)

    try {
      const server = getHorizonServer(network)
      const res = await server.assets().forCode(code).forIssuer(issuer).call()

      if (fetchId !== requestRef.current) return

      const raw = res.records[0]
      if (!raw) throw new Error(`Asset ${code}:${issuer} not found`)
      const assetRecord = raw as typeof raw & { home_domain?: string }

      setAsset({
        code: raw.asset_code,
        issuer: raw.asset_issuer,
        supply: raw.amount,
        numAccounts: raw.num_accounts,
        homeDomain: assetRecord.home_domain,
        flags: {
          authRequired: raw.flags.auth_required,
          authRevocable: raw.flags.auth_revocable,
          authImmutable: raw.flags.auth_immutable,
        },
      })
    } catch (err) {
      if (fetchId !== requestRef.current) return
      setError(err instanceof Error ? err.message : "Failed to fetch asset")
    } finally {
      if (fetchId === requestRef.current) {
        setLoading(false)
      }
    }
  }, [code, issuer, network])

  useEffect(() => {
    fetchAsset()
    return () => {
      requestRef.current = -1
    }
  }, [fetchAsset])

  return { asset, loading, error, refetch: fetchAsset }
}
