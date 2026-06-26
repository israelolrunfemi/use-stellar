import { useCallback } from "react";
import freighterApi from "@stellar/freighter-api";

const { getNetworkDetails, isConnected, requestAccess } =
  typeof freighterApi.isConnected === "function"
    ? freighterApi
    : (freighterApi as any).default;
import { useStellarContext } from "../context/StellarProvider";
import type { WalletState, WalletType } from "../types";

export interface UseWalletReturn extends WalletState {
  connect:    (wallet?: WalletType) => Promise<void>;
  disconnect: () => void;
}

export function useWallet(): UseWalletReturn {
  const { wallet, setWallet, network } = useStellarContext();

  const connect = useCallback(
    async (walletType: WalletType = "freighter") => {
      setWallet(prev => ({ ...prev, connecting: true, error: null }));

      try {
        let address: string;

        if (walletType === "freighter") {
          address = await connectFreighter(network);
        } else {
          throw new Error(
            `Wallet "${walletType}" not yet supported. ` +
            `Contributions welcome — see GitHub issues.`
          );
        }

        setWallet({
          connected:  true,
          address,
          network,
          wallet:     walletType,
          connecting: false,
          error:      null,
        });
      } catch (err) {
        setWallet(prev => ({
          ...prev,
          connecting: false,
          error:      err instanceof Error ? err.message : "Failed to connect wallet",
        }));
      }
    },
    [setWallet, network]
  );

  const disconnect = useCallback(() => {
    setWallet({
      connected:  false,
      address:    null,
      network:    null,
      wallet:     null,
      connecting: false,
      error:      null,
    });
  }, [setWallet]);

  return { ...wallet, connect, disconnect };
}

// ── Freighter connector ────────────────────────────────────────────────────
async function connectFreighter(network: string): Promise<string> {
  const connection = await isConnected();
  if (connection.error || !connection.isConnected) {
    throw new Error(
      "Freighter wallet not found. " +
      "Install the Freighter browser extension and try again."
    );
  }

  const access = await requestAccess();
  if (access.error) {
    throw new Error(access.error.message);
  }

  if (!access.address) {
    throw new Error("Freighter did not return a wallet address.");
  }

  const networkDetails = await getNetworkDetails();
  if (networkDetails.error) {
    throw new Error(networkDetails.error.message);
  }

  // Validate we're on the right network
  const expectedPassphrase =
    network === "mainnet"
      ? "Public Global Stellar Network ; September 2015"
      : "Test SDF Network ; September 2015";

  if (networkDetails.networkPassphrase !== expectedPassphrase) {
    throw new Error(
      `Wrong network. Switch Freighter to ${network} and try again.`
    );
  }

  return access.address;
}
