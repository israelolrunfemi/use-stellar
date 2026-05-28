import { useState, useEffect } from "react";
import { useStellarContext }   from "../context/StellarProvider";
import { getHorizonServer }    from "../utils";

export interface AssetInfo {
  code:        string;
  issuer:      string;
  supply:      string;
  homeDomain?: string;
  numAccounts: number;
  flags: {
    authRequired:  boolean;
    authRevocable: boolean;
    authImmutable: boolean;
  };
}

export interface UseAssetOptions {
  code:   string;
  issuer: string;
}

export interface UseAssetReturn {
  asset:   AssetInfo | null;
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

export function useAsset({ code, issuer }: UseAssetOptions): UseAssetReturn {
  const { network } = useStellarContext();

  const [asset,   setAsset]   = useState<AssetInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function fetchAsset() {
    setLoading(true);
    setError(null);

    try {
      const server = getHorizonServer(network);
      const res    = await server
        .assets()
        .forCode(code)
        .forIssuer(issuer)
        .call();

      const raw = res.records[0];
      if (!raw) throw new Error(`Asset ${code}:${issuer} not found`);

      setAsset({
        code:        raw.asset_code,
        issuer:      raw.asset_issuer,
        supply:      raw.amount,
        numAccounts: raw.num_accounts,
        flags: {
          authRequired:  raw.flags.auth_required,
          authRevocable: raw.flags.auth_revocable,
          authImmutable: raw.flags.auth_immutable,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch asset");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAsset();
  }, [code, issuer, network]);

  return { asset, loading, error, refetch: fetchAsset };
}
