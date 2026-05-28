import { useState, useEffect } from "react";
import { SorobanRpc, xdr }     from "@stellar/stellar-sdk";
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
  args = [],
}: ContractCallOptions): UseSorobanContractReturn {
  const { networkConfig } = useStellarContext();

  const [data,    setData]    = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function callContract() {
    setLoading(true);
    setError(null);

    try {
      const server = new SorobanRpc.Server(networkConfig.sorobanUrl);

      // Build a simulation request for read-only calls
      // Full write support (signing + submitting) tracked in GitHub issue #10
      const account = await server.getAccount(contractId).catch(() => null);
      if (!account) {
        throw new Error(`Contract ${contractId} not found on ${networkConfig.network}`);
      }

      // For now expose the raw simulation result
      // Typed return values tracked in GitHub issue #11
      setData({ contractId, method, note: "Simulation wiring tracked in issue #10" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Contract call failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    callContract();
  }, [contractId, method, networkConfig]);

  return { data, loading, error, refetch: callContract };
}
