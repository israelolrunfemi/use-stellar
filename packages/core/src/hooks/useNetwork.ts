import { useStellarContext } from "../context/StellarProvider";
import type { StellarNetwork, NetworkConfig } from "../types";

export interface UseNetworkReturn {
  network:       StellarNetwork;
  networkConfig: NetworkConfig;
  isTestnet:     boolean;
  isMainnet:     boolean;
}

export function useNetwork(): UseNetworkReturn {
  const { network, networkConfig } = useStellarContext();

  return {
    network,
    networkConfig,
    isTestnet: network === "testnet",
    isMainnet: network === "mainnet",
  };
}
