import { useState, useEffect, useCallback } from "react";
import { useStellarContext }   from "../context/StellarProvider";
import { getHorizonServer, parseHorizonBalance } from "../utils";
import type { Asset, Balance } from "../types";

// Default polling interval (ms) used when `watch` is enabled without an explicit
// `interval`.
const DEFAULT_WATCH_INTERVAL = 10_000;

export interface UseBalanceOptions {
  address?:  string | null;   // defaults to connected wallet address
  asset?:    Asset;           // defaults to XLM
  watch?:    boolean;         // auto re-fetch on an interval (default false)
  interval?: number;          // polling interval in ms when watch is true (default 10000)
}

export interface UseBalanceReturn {
  balance:     string | null;
  balances:    Balance[];
  loading:     boolean;
  error:       string | null;
  lastUpdated: Date | null;   // timestamp of the last successful fetch
  refetch:     () => void;
}

export function useBalance({
  address,
  asset = "XLM",
  watch = false,
  interval = DEFAULT_WATCH_INTERVAL,
}: UseBalanceOptions = {}): UseBalanceReturn {
  const { network, wallet }      = useStellarContext();
  const resolvedAddress          = address ?? wallet.address;

  const [balances, setBalances]       = useState<Balance[]>([]);
  const [loading,  setLoading]        = useState(false);
  const [error,    setError]          = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!resolvedAddress) return;

    setLoading(true);
    setError(null);

    try {
      const server  = getHorizonServer(network);
      const account = await server.loadAccount(resolvedAddress);
      const parsed  = account.balances.map(parseHorizonBalance);
      setBalances(parsed);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  }, [resolvedAddress, network]);

  useEffect(() => {
    fetchBalances();

    if (!watch) return;

    // Guard against non-positive intervals that would busy-loop setInterval.
    const ms = interval > 0 ? interval : DEFAULT_WATCH_INTERVAL;
    const id = setInterval(fetchBalances, ms);
    return () => clearInterval(id);
  }, [fetchBalances, watch, interval]);

  // Find the specific asset balance
  const match = balances.find(b => {
    if (asset === "XLM") return b.asset === "XLM";
    if (typeof asset === "object" && typeof b.asset === "object") {
      return b.asset.code === asset.code && b.asset.issuer === asset.issuer;
    }
    return false;
  });
  const balance    = match?.balance ?? null;

  return {
    balance,
    balances,
    loading,
    error,
    lastUpdated,
    refetch: fetchBalances,
  };
}
