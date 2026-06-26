import { useState, useEffect, useCallback } from "react";
import { useStellarContext }   from "../context/StellarProvider";
import { getHorizonServer, parseHorizonBalance } from "../utils";
import type { Asset, Balance } from "../types";

export interface UseBalanceOptions {
  address?: string | null;   // defaults to connected wallet address
  asset?:   Asset;           // defaults to XLM
  watch?:   boolean;         // re-fetch every 10s
}

export interface UseBalanceReturn {
  balance:   string | null;
  balances:  Balance[];
  loading:   boolean;
  error:     string | null;
  refetch:   () => void;
}

export function useBalance({
  address,
  asset = "XLM",
  watch = false,
}: UseBalanceOptions = {}): UseBalanceReturn {
  const { network, wallet }      = useStellarContext();
  const resolvedAddress          = address ?? wallet.address;

  const [balances, setBalances]  = useState<Balance[]>([]);
  const [loading,  setLoading]   = useState(false);
  const [error,    setError]     = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!resolvedAddress) return;

    setLoading(true);
    setError(null);

    try {
      const server  = getHorizonServer(network);
      const account = await server.loadAccount(resolvedAddress);
      const parsed  = account.balances.map(parseHorizonBalance);
      setBalances(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  }, [resolvedAddress, network]);

  useEffect(() => {
    fetchBalances();

    if (watch) {
      const interval = setInterval(fetchBalances, 10_000);
      return () => clearInterval(interval);
    }
  }, [fetchBalances, watch]);

  // Find the specific asset balance
  const match = balances.find(b => {
    if (asset === "XLM") return b.asset === "XLM";
    if (typeof asset === "object" && typeof b.asset === "object") {
      return b.asset.code === asset.code && b.asset.issuer === asset.issuer;
    }
    return false;
  });
  const balance = match?.balance ?? null;

  return {
    balance,
    balances,
    loading,
    error,
    refetch: fetchBalances,
  };
}
