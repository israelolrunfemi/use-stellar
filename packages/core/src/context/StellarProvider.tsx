import * as React from "react";
import {
  createContext,
  useContext,
  useState,
} from "react";
import type {
  CustomNetworkConfig,
  NetworkConfig,
  StellarContextValue,
  StellarNetwork,
  WalletState,
} from "../types";
import { NETWORK_CONFIGS } from "../types";

// ── Default wallet state ───────────────────────────────────────────────────
const DEFAULT_WALLET: WalletState = {
  connected:  false,
  address:    null,
  network:    null,
  wallet:     null,
  connecting: false,
  error:      null,
};

// ── Context ────────────────────────────────────────────────────────────────
const StellarContext = createContext<StellarContextValue | null>(null);

// ── Validation ─────────────────────────────────────────────────────────────
/**
 * Validates a custom network config override and returns the merged
 * `NetworkConfig`. Throws a descriptive error if required URLs are missing
 * or obviously malformed so developers catch misconfiguration at startup.
 */
function resolveNetworkConfig(
  network: StellarNetwork,
  override: CustomNetworkConfig | undefined,
): NetworkConfig {
  if (!override) {
    // No override — use the built-in SDF defaults.
    return NETWORK_CONFIGS[network];
  }

  const { horizonUrl, sorobanUrl } = override;

  if (!horizonUrl || typeof horizonUrl !== "string" || horizonUrl.trim() === "") {
    throw new Error(
      "use-stellar: Invalid networkConfig — `horizonUrl` is required when " +
      "providing a custom networkConfig. " +
      "Example: { horizonUrl: \"https://horizon.my-node.com\", sorobanUrl: \"...\" }"
    );
  }

  if (!sorobanUrl || typeof sorobanUrl !== "string" || sorobanUrl.trim() === "") {
    throw new Error(
      "use-stellar: Invalid networkConfig — `sorobanUrl` is required when " +
      "providing a custom networkConfig. " +
      "Example: { horizonUrl: \"...\", sorobanUrl: \"https://rpc.my-node.com\" }"
    );
  }

  return {
    network,
    horizonUrl: horizonUrl.trim(),
    sorobanUrl: sorobanUrl.trim(),
  };
}

// ── Provider ───────────────────────────────────────────────────────────────
export interface StellarProviderProps {
  /** The Stellar network to connect to. Defaults to `"testnet"`. */
  network?:       StellarNetwork;
  /**
   * Optional override for Horizon and Soroban RPC endpoints.
   * When omitted, the built-in SDF public endpoints are used.
   *
   * Both `horizonUrl` and `sorobanUrl` are required when this prop is provided.
   *
   * @example
   * // Custom private node:
   * <StellarProvider
   *   network="mainnet"
   *   networkConfig={{
   *     horizonUrl: "https://horizon.my-node.com",
   *     sorobanUrl: "https://rpc.my-node.com",
   *   }}
   * />
   */
  networkConfig?: CustomNetworkConfig;
  children:       React.ReactNode;
}

export function StellarProvider({
  network       = "testnet",
  networkConfig: networkConfigOverride,
  children,
}: StellarProviderProps) {
  // Resolve once at render time — throws immediately on bad config so
  // developers see the error in the console/overlay rather than silently
  // getting undefined URLs at request time.
  const resolvedNetworkConfig = resolveNetworkConfig(network, networkConfigOverride);

  const [wallet, setWallet] = useState<WalletState>(DEFAULT_WALLET);

  const value: StellarContextValue = {
    network,
    networkConfig: resolvedNetworkConfig,
    wallet,
    setWallet,
  };

  return (
    <StellarContext.Provider value={value}>
      {children}
    </StellarContext.Provider>
  );
}

// ── Hook to consume context ────────────────────────────────────────────────
export function useStellarContext(): StellarContextValue {
  const ctx = useContext(StellarContext);
  if (!ctx) {
    throw new Error(
      "use-stellar: No StellarProvider found. " +
      "Wrap your app in <StellarProvider> before using any use-stellar hooks."
    );
  }
  return ctx;
}
