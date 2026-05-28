import { useState, useEffect } from "react";
import { useStellarContext }   from "../context/StellarProvider";
import { getHorizonServer }    from "../utils";
import type { TransactionResult, TransactionStatus } from "../types";

export interface UseTransactionOptions {
  hash:   string | null;
  watch?: boolean;    // keep polling until success or failed
}

export interface UseTransactionReturn {
  transaction: TransactionResult | null;
  loading:     boolean;
  error:       string | null;
  refetch:     () => void;
}

export function useTransaction({
  hash,
  watch = false,
}: UseTransactionOptions): UseTransactionReturn {
  const { network } = useStellarContext();

  const [transaction, setTransaction] = useState<TransactionResult | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  async function fetchTransaction() {
    if (!hash) return;

    setLoading(true);
    setError(null);

    try {
      const server = getHorizonServer(network);
      const raw    = await server.transactions().transaction(hash).call();

      const status: TransactionStatus = raw.successful ? "success" : "failed";

      setTransaction({
        hash:      raw.hash,
        status,
        ledger:    raw.ledger,
        createdAt: raw.created_at,
        fee:       raw.fee_charged,
      });
    } catch (err: unknown) {
      // 404 means not found / still pending
      const is404 = (err as { response?: { status: number } })?.response?.status === 404;
      if (is404) {
        setTransaction({ hash: hash!, status: "pending" });
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch transaction");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransaction();

    if (watch) {
      const interval = setInterval(() => {
        // Stop polling once we have a final status
        if (
          transaction?.status === "success" ||
          transaction?.status === "failed"
        ) return;
        fetchTransaction();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [hash, network]);

  return { transaction, loading, error, refetch: fetchTransaction };
}
