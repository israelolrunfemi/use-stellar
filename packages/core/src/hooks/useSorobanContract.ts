import { useState, useEffect, useCallback } from "react";
import {
  SorobanRpc,
  Contract,
  xdr,
  scValToNative,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Account,
} from "@stellar/stellar-sdk";
import { useStellarContext } from "../context/StellarProvider";
import type { ContractCallOptions } from "../types";

export interface UseSorobanContractReturn {
  data: unknown | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function toScVal(arg: unknown): xdr.ScVal {
  if (arg instanceof xdr.ScVal) return arg;
  if (typeof arg === "string") return xdr.ScVal.scvString(arg);
  if (typeof arg === "boolean") return xdr.ScVal.scvBool(arg);
  if (typeof arg === "number") {
    if (!Number.isInteger(arg))
      throw new Error(
        `Non-integer numbers are not supported. Use a string representation instead.`
      );
    return arg < 0
      ? xdr.ScVal.scvI128(
          new xdr.Int128Parts({
            hi: xdr.Int64.fromString("-1"),
            lo: xdr.Uint64.fromString(
              String(BigInt(arg) & BigInt("0xFFFFFFFFFFFFFFFF"))
            ),
          })
        )
      : xdr.ScVal.scvU64(xdr.Uint64.fromString(String(arg)));
  }
  throw new Error(
    `Unsupported argument type: ${typeof arg}. Pass an xdr.ScVal directly for complex types.`
  );
}

function isValidContractId(id: string): boolean {
  return typeof id === "string" && /^C[A-Z2-7]{55}$/.test(id);
import { useState, useEffect, useCallback, useRef } from "react"
import { useStellarContext } from "../context/StellarProvider"
import { toStellarError } from "../errors"
import type { ContractCallOptions, StellarError } from "../types"

export interface UseSorobanContractReturn {
  data: unknown | null
  loading: boolean
  error: StellarError | null
  refetch: () => void
}

export function useSorobanContract({
  contractId,
  method,
  args = [],
}: ContractCallOptions): UseSorobanContractReturn {
  const { networkConfig } = useStellarContext();

  const [data, setData] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callContract = useCallback(async () => {
    if (!contractId || !method) {
      setData(null);
      setError(null);
      return;
    }

    if (!isValidContractId(contractId)) {
      setError(
        `Invalid contract ID "${contractId}". Must be a C-prefixed 56-character Stellar address.`
      );
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const server = new SorobanRpc.Server(networkConfig.sorobanUrl, {
        allowHttp: networkConfig.sorobanUrl.startsWith("http://"),
      });

      let scArgs: xdr.ScVal[];
      try {
        scArgs = args.map(toScVal);
      } catch (argErr) {
        throw new Error(
          `Argument conversion failed: ${argErr instanceof Error ? argErr.message : String(argErr)}`
        );
      }

      const contract = new Contract(contractId);
      const operation = contract.call(method, ...scArgs);

      const sourceAccount = new Account(
        "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
        "0"
      );
      const networkPassphrase =
        networkConfig.network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;

      const tx = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase,
  const [data, setData] = useState<unknown | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<StellarError | null>(null)

  const requestRef = useRef(0)

  const callContract = useCallback(async () => {
    const fetchId = ++requestRef.current
    setLoading(true)
    setError(null)

    try {
      if (!contractId || !method) {
        if (fetchId !== requestRef.current) return
        setData(null)
        return
      }

      if (fetchId !== requestRef.current) return

      setData({
        contractId,
        method,
        network: networkConfig.network,
        note: "Simulation wiring tracked in issue #10",
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      const simResult = await server.simulateTransaction(tx);

      if (SorobanRpc.Api.isSimulationError(simResult)) {
        throw new Error(`RPC simulation error: ${simResult.error}`);
      }

      if (!SorobanRpc.Api.isSimulationSuccess(simResult)) {
        throw new Error("Simulation did not return a successful result.");
      }

      const returnVal = simResult.result?.retval;
      if (!returnVal) {
        setData(null);
        return;
      }

      try {
        setData(scValToNative(returnVal));
      } catch {
        setData({ raw: returnVal.toXDR("base64") });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Contract call failed");
      setData(null);
    } finally {
      setLoading(false);
      if (fetchId !== requestRef.current) return
      setError(toStellarError(err))
    } finally {
      if (fetchId === requestRef.current) {
        setLoading(false)
      }
    }
  }, [contractId, method, args, networkConfig]);

  useEffect(() => {
    callContract();
  }, [callContract]);
    callContract()
    return () => {
      requestRef.current = -1
    }
  }, [callContract])

  return { data, loading, error, refetch: callContract };
}
