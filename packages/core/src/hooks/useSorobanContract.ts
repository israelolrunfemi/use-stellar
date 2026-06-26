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

/**
 * Convert a JavaScript value to a Soroban ScVal argument.
 *
 * Supported types:
 * - `string`  → ScString
 * - `number`  → ScU64 (integers) or ScI128 (negatives)
 * - `boolean` → ScBool
 * - `xdr.ScVal` passthrough — callers can pass pre-built ScVals directly
 *
 * For complex types (Address, Bytes, Vec, Map) callers should construct
 * the ScVal themselves using `@stellar/stellar-sdk`'s `xdr` namespace and
 * pass it as an arg.
 */
function toScVal(arg: unknown): xdr.ScVal {
  if (arg instanceof xdr.ScVal) return arg;
  if (typeof arg === "string")  return xdr.ScVal.scvString(arg);
  if (typeof arg === "boolean") return xdr.ScVal.scvBool(arg);
  if (typeof arg === "number") {
    if (!Number.isInteger(arg)) throw new Error(`Non-integer numbers are not supported. Use a string representation instead.`);
    return arg < 0
      ? xdr.ScVal.scvI128(new xdr.Int128Parts({ hi: xdr.Int64.fromString("-1"), lo: xdr.Uint64.fromString(String(BigInt(arg) & BigInt("0xFFFFFFFFFFFFFFFF"))) }))
      : xdr.ScVal.scvU64(xdr.Uint64.fromString(String(arg)));
  }
  throw new Error(`Unsupported argument type: ${typeof arg}. Pass an xdr.ScVal directly for complex types.`);
}

/**
 * Validate a Soroban contract ID (C-prefixed Stellar strkey, 56 chars).
 */
function isValidContractId(id: string): boolean {
  return typeof id === "string" && /^C[A-Z2-7]{55}$/.test(id);
}

/**
 * useSorobanContract — simulate a read-only Soroban contract method.
 *
 * Calls `simulateTransaction` on the Soroban RPC endpoint so no
 * signature or fee is required. Write operations are out of scope —
 * use a full transaction flow for state-mutating calls.
 *
 * @param contractId  - C-prefixed Soroban contract address.
 * @param method      - Contract method name (snake_case or camelCase).
 * @param args        - Optional array of JS values or `xdr.ScVal` instances.
 *
 * @returns `{ data, loading, error, refetch }`
 *   - `data` is the JS-decoded result when possible, otherwise the raw
 *     XDR string.
 *   - `error` contains a human-readable message on failure.
 */
export function useSorobanContract({
  contractId,
  method,
  args = [],
}: ContractCallOptions): UseSorobanContractReturn {
  const { networkConfig } = useStellarContext();

  const [data,    setData]    = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const callContract = useCallback(async () => {
    // Guard: skip if inputs are empty
    if (!contractId || !method) {
      setData(null);
      setError(null);
      return;
    }

    // Guard: validate contract ID format
    if (!isValidContractId(contractId)) {
      setError(`Invalid contract ID "${contractId}". Must be a C-prefixed 56-character Stellar address.`);
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const server = new SorobanRpc.Server(networkConfig.sorobanUrl, {
        allowHttp: networkConfig.sorobanUrl.startsWith("http://"),
      });

      // Build ScVal arguments
      let scArgs: xdr.ScVal[];
      try {
        scArgs = args.map(toScVal);
      } catch (argErr) {
        throw new Error(`Argument conversion failed: ${argErr instanceof Error ? argErr.message : String(argErr)}`);
      }

      // Build a simulation-only transaction (no source account needed for read-only)
      const contract = new Contract(contractId);
      const operation = contract.call(method, ...scArgs);

      // simulateTransaction requires a minimal transaction envelope
      const { Transaction, TransactionBuilder, Networks, BASE_FEE } = await import("@stellar/stellar-sdk");
      // Use a well-known Stellar Foundation account as dummy source for simulation.
      // No real account lookup is needed for read-only simulateTransaction calls.
      const { Account } = await import("@stellar/stellar-sdk");
      const sourceAccount = new Account(
        "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
        "0"
      );
      const networkPassphrase = networkConfig.network === "mainnet"
        ? Networks.PUBLIC
        : Networks.TESTNET;

      const tx = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase,
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

      // Decode the result
      const returnVal = simResult.result?.retval;
      if (!returnVal) {
        setData(null);
        return;
      }

      try {
        setData(scValToNative(returnVal));
      } catch {
        // Fall back to raw XDR string if native decoding fails
        setData({ raw: returnVal.toXDR("base64") });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Contract call failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [contractId, method, args, networkConfig]);

  useEffect(() => {
    callContract();
  }, [callContract]);

  return { data, loading, error, refetch: callContract };
}
