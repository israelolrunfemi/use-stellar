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
import type { SendPaymentOptions, SendPaymentResult, Asset } from "../types";

export interface UseSendPaymentReturn {
  send:    (options: SendPaymentOptions) => Promise<SendPaymentResult>;
  loading: boolean;
  error:   string | null;
  result:  SendPaymentResult | null;
  reset:   () => void;
}

export function useSendPayment(): UseSendPaymentReturn {
  const { network, networkConfig, wallet } = useStellarContext();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [result,  setResult]  = useState<SendPaymentResult | null>(null);

  const send = useCallback(
    async (options: SendPaymentOptions): Promise<SendPaymentResult> => {
      if (!wallet.connected || !wallet.address) {
        throw new Error("Wallet not connected. Call connect() first.");
      }

      setLoading(true);
      setError(null);

      try {
        const server     = getHorizonServer(network);
        const sourceAcc  = await server.loadAccount(wallet.address);
        const networkPass = network === "mainnet"
          ? Networks.PUBLIC
          : Networks.TESTNET;

        // ── Build the operation ──────────────────────────────────────────
        const stellarAsset = toStellarAsset(options.asset);
        const operation    = Operation.payment({
          destination: options.to,
          asset:       stellarAsset,
          amount:      options.amount,
        });

        // ── Build the transaction ────────────────────────────────────────
        const builder = new TransactionBuilder(sourceAcc, {
          fee:               BASE_FEE,
          networkPassphrase: networkPass,
        }).addOperation(operation).setTimeout(30);

        if (options.memo) {
          builder.addMemo(Memo.text(options.memo));
        }

        const tx  = builder.build();
        const xdr = tx.toXDR();

        // ── Sign with Freighter ──────────────────────────────────────────
        const freighter = (window as unknown as { freighter?: { signTransaction: (xdr: string, opts?: object) => Promise<{ signedTxXdr: string }> } }).freighter;
        if (!freighter) throw new Error("Freighter wallet not found");

        const { signedTxXdr } = await freighter.signTransaction(xdr, {
          networkPassphrase: networkPass,
        });

        // ── Submit ───────────────────────────────────────────────────────
        const signed = TransactionBuilder.fromXDR(signedTxXdr, networkPass);
        const res    = await server.submitTransaction(signed);

        const outcome: SendPaymentResult = {
          hash:   res.hash,
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

// ── Convert our Asset type to Stellar SDK Asset ────────────────────────────
function toStellarAsset(asset: Asset): StellarAsset {
  if (isNativeAsset(asset)) return StellarAsset.native();
  return new StellarAsset(asset.code, asset.issuer);
}
