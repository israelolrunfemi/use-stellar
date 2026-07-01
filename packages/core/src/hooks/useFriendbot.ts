import { useCallback, useState } from "react";
import { useStellarContext } from "../context/StellarProvider";
import { isValidStellarAddress } from "../utils";

export interface UseFriendbotOptions {
  address?: string | null;
}

export interface UseFriendbotReturn {
  loading: boolean;
  error: string | null;
  hash: string | null;
  funded: boolean;
  fund: (address?: string | null) => Promise<void>;
}

const FRIENDBOT_URL = "https://friendbot.stellar.org";

export function useFriendbot({ address }: UseFriendbotOptions = {}): UseFriendbotReturn {
  const { network, wallet } = useStellarContext();
  const resolvedAddress = address ?? wallet.address;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [funded, setFunded] = useState(false);

  const fund = useCallback(async (fundAddress?: string | null) => {
    const target = fundAddress ?? resolvedAddress;

    if (!target) {
      setError("No Stellar address provided. Connect a wallet or pass a G... address.");
      return;
    }

    if (network !== "testnet") {
      setError("Friendbot funding is only available on testnet.");
      return;
    }

    if (!isValidStellarAddress(target)) {
      setError("Invalid Stellar address. Use a valid G... address.");
      return;
    }

    setLoading(true);
    setError(null);
    setHash(null);
    setFunded(false);

    try {
      const response = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(target)}`);

      if (!response.ok) {
        throw new Error(`Friendbot request failed with status ${response.status}.`);
      }

      const body = await response.json();
      const txHash = body?.hash;

      if (!txHash || typeof txHash !== "string") {
        throw new Error("Friendbot funding did not return a transaction hash.");
      }

      setHash(txHash);
      setFunded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fund account.");
    } finally {
      setLoading(false);
    }
  }, [network, resolvedAddress]);

  return { loading, error, hash, funded, fund };
}
