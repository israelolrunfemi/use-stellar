import { useState, useEffect } from "react";
import { useStellarContext }   from "../context/StellarProvider";
import { getHorizonServer, parseHorizonBalance } from "../utils";
import type { AccountInfo } from "../types";

export interface UseAccountOptions {
  address?: string | null;   // defaults to connected wallet address
}

export interface UseAccountReturn {
  account:  AccountInfo | null;
  loading:  boolean;
  error:    string | null;
  refetch:  () => void;
}

export function useAccount({ address }: UseAccountOptions = {}): UseAccountReturn {
  const { network, wallet }      = useStellarContext();
  const resolvedAddress          = address ?? wallet.address;

  const [account, setAccount]    = useState<AccountInfo | null>(null);
  const [loading, setLoading]    = useState(false);
  const [error,   setError]      = useState<string | null>(null);

  async function fetchAccount() {
    if (!resolvedAddress) return;

    setLoading(true);
    setError(null);

    try {
      const server  = getHorizonServer(network);
      const raw     = await server.loadAccount(resolvedAddress);

      const info: AccountInfo = {
        address:       raw.id,
        sequence:      raw.sequenceNumber(),
        balances:      raw.balances.map(parseHorizonBalance),
        subentryCount: raw.subentry_count,
        thresholds: {
          lowThreshold:  raw.thresholds.low_threshold,
          medThreshold:  raw.thresholds.med_threshold,
          highThreshold: raw.thresholds.high_threshold,
        },
        signers: raw.signers.map(s => ({
          key:    s.key,
          weight: s.weight,
          type:   s.type,
        })),
      };

      setAccount(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch account");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAccount();
  }, [resolvedAddress, network]);

  return { account, loading, error, refetch: fetchAccount };
}
