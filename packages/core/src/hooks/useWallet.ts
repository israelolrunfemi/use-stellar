import { useCallback } from "react";
import { useStellarContext } from "../context/StellarProvider";
import type { WalletState, WalletType } from "../types";
import { getWalletAdapter } from "../wallets";

export interface UseWalletReturn extends WalletState {
  connect: (wallet?: WalletType) => Promise<void>;
  disconnect: () => void;
}

export function useWallet(): UseWalletReturn {
  const { wallet, setWallet, network } = useStellarContext();

  const connect = useCallback(
    async (walletType: WalletType = "freighter") => {
      setWallet(prev => ({ ...prev, connecting: true, error: null }));

      try {
        const adapter = getWalletAdapter(walletType);
        const connection = await adapter.connect(network);

        setWallet({
          connected: true,
          address: connection.address,
          network: connection.network,
          wallet: connection.wallet,
          walletName: adapter.metadata.name,
          connecting: false,
          error: null,
        });
      } catch (err) {
        setWallet(prev => ({
          ...prev,
          connecting: false,
          error: err instanceof Error ? err.message : "Failed to connect wallet",
        }));
      }
    },
    [setWallet, network]
  );

  const disconnect = useCallback(() => {
    if (wallet.wallet) {
      void getWalletAdapter(wallet.wallet).disconnect?.();
    }

    setWallet({
      connected: false,
      address: null,
      network: null,
      wallet: null,
      walletName: null,
      connecting: false,
      error: null,
    });
  }, [setWallet, wallet.wallet]);

  return { ...wallet, connect, disconnect };
}
