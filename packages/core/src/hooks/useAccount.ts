import { useState, useEffect, useCallback } from "react";
import { useStellarContext }   from "../context/StellarProvider";
import { getHorizonServer, parseHorizonBalance } from "../utils";
import type { AccountInfo } from "../types";
import { useState, useEffect, useRef } from "react"
import { useStellarContext } from "../context/StellarProvider"
import { getHorizonServer, parseHorizonBalance } from "../utils"
import { toStellarError } from "../errors"
import type { AccountInfo, StellarError } from "../types"

export interface UseAccountOptions {
  address?: string | null // defaults to connected wallet address
}

export interface UseAccountReturn {
  data:  AccountInfo | null;
  loading:  boolean
  error:    string | null;
  refetch:  () => void;
  account: AccountInfo | null
  loading: boolean
  error: StellarError | null
  refetch: () => void
}

/**
 * Fetches account information including balances, sequence number, and signers.
 *
 * @param options - Configuration options
 * @param options.address - The Stellar address to fetch. Defaults to the connected wallet.
 * @returns `{ account, loading, error, refetch }`
 *
 * @example
 * const { account, loading } = useAccount({ address: "G..." })
 */
export function useAccount({ address }: UseAccountOptions = {}): UseAccountReturn {
  const { network, wallet } = useStellarContext()
  const resolvedAddress = address ?? wallet.address

  const [data, setData]          = useState<AccountInfo | null>(null);
  const [loading, setLoading]    = useState(false);
  const [error,   setError]      = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    if (!resolvedAddress) return;
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<StellarError | null>(null)

  const requestRef = useRef(0)

  async function fetchAccount() {
    if (!resolvedAddress) return

    const fetchId = ++requestRef.current
    setLoading(true)
    setError(null)

    try {
      const server = getHorizonServer(network)
      const raw = await server.loadAccount(resolvedAddress)

      if (fetchId !== requestRef.current) return

      const info: AccountInfo = {
        address: raw.id,
        sequence: raw.sequenceNumber(),
        balances: raw.balances.map(parseHorizonBalance),
        subentryCount: raw.subentry_count,
        thresholds: {
          lowThreshold: raw.thresholds.low_threshold,
          medThreshold: raw.thresholds.med_threshold,
          highThreshold: raw.thresholds.high_threshold,
        },
        signers: raw.signers.map(s => ({
          key: s.key,
          weight: s.weight,
          type: s.type,
        })),
      }

      setAccount(info)
    } catch (err) {
      if (fetchId !== requestRef.current) return
      setError(toStellarError(err))
    } finally {
      if (fetchId === requestRef.current) {
        setLoading(false)
      }
    }
  }, [resolvedAddress, network]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  return { data, loading, error, refetch: fetchAccount };
    fetchAccount()
    return () => {
      requestRef.current = -1
    }
  }, [resolvedAddress, network])

  return { account, loading, error, refetch: fetchAccount }
}
