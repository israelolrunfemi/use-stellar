import { useState, useEffect, useCallback } from "react";
import { useStellarContext }    from "../context/StellarProvider";
import type { ContractCallOptions } from "../types";

export interface UseSorobanContractReturn {
  data:    unknown | null;
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

export function useSorobanContract({
  contractId,
  method,
}: ContractCallOptions): UseSorobanContractReturn {
  const { networkConfig } = useStellarContext();

  const [data,    setData]    = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const callContract = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!contractId || !method) {
        setData(null);
        return;
      }

      setData({
        contractId,
        method,
        network: networkConfig.network,
        note: "Simulation wiring tracked in issue #10",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Contract call failed");
    } finally {
      setLoading(false);
    }
  }, [contractId, method, networkConfig]);

  useEffect(() => {
    callContract();
  }, [callContract]);

  return { data, loading, error, refetch: callContract };
}
