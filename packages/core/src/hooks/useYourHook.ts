import { useState, useEffect } from "react";
import { useStellarContext }   from "../context/StellarProvider";
import type { StellarError }   from "../types";
import { parseStellarError }   from "../utils/errorParser";

export interface UseYourHookReturn {
  data:    SomeType | null;
  loading: boolean;
  error:   StellarError | null;
  refetch: () => void;
}

export function useYourHook(): UseYourHookReturn {
  const { network } = useStellarContext();
  const [data,    setData]    = useState<SomeType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<StellarError | null>(null);

  async function fetch() {
    setLoading(true);
    setError(null);
    try {
      // your logic here
    } catch (err) {
      setError(parseStellarError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetch(); }, [network]);

  return { data, loading, error, refetch: fetch };
}