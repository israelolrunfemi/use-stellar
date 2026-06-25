import { useState, useCallback } from "react";
import {
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Operation,
  Asset as StellarAsset,
  Memo,
} from "@stellar/stellar-sdk";
import { useStellarContext } from "../context/StellarProvider";
import { getHorizonServer, isNativeAsset } from "../utils";
import { getWalletAdapter } from "../wallets";
import type { SendPaymentOptions, SendPaymentResult, Asset } from "../types";

export interface UseSendPaymentReturn {
  send: (options: SendPaymentOptions) => Promise<SendPaymentResult>;
  loading: boolean;
  error: string | null;
  result: SendPaymentResult | null;
  reset: () => void;
}

export function useSendPayment(): UseSendPaymentReturn {
  const { network, wallet } = useStellarContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SendPaymentResult | null>(null);

  const send = useCallback(
    async (options: SendPaymentOptions): Promise<SendPaymentResult> => {
      if (!wallet.connected || !wallet.address) {
        throw new Error("Wallet not connected. Call connect() first.");
      }
      if (!wallet.wallet) {
        throw new Error("No wallet adapter selected. Call connect() first.");
      }

      setLoading(true);
      setError(null);

      try {
        const server = getHorizonServer(network);
        const sourceAcc = await server.loadAccount(wallet.address);
        const networkPass = network === "mainnet"
          ? Networks.PUBLIC
          : Networks.TESTNET;

        const stellarAsset = toStellarAsset(options.asset);
        const operation = Operation.payment({
          destination: options.to,
          asset: stellarAsset,
          amount: options.amount,
        });

        const builder = new TransactionBuilder(sourceAcc, {
          fee: BASE_FEE,
          networkPassphrase: networkPass,
        }).addOperation(operation).setTimeout(30);

        if (options.memo) {
          builder.addMemo(Memo.text(options.memo));
        }

        const tx = builder.build();
        const xdr = tx.toXDR();
        const adapter = getWalletAdapter(wallet.wallet);
        const signedTxXdr = await adapter.signTransaction(xdr, {
          address: wallet.address,
          network,
          networkPassphrase: networkPass,
        });

        const signed = TransactionBuilder.fromXDR(signedTxXdr, networkPass);
        const res = await server.submitTransaction(signed);

        const outcome: SendPaymentResult = {
          hash: res.hash,
          status: "success",
        };

        setResult(outcome);
        return outcome;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [network, wallet]
  );

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return { send, loading, error, result, reset };
}

function toStellarAsset(asset: Asset): StellarAsset {
  if (isNativeAsset(asset)) return StellarAsset.native();
  return new StellarAsset(asset.code, asset.issuer);
}
