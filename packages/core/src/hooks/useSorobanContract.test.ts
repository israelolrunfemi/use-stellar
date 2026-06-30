/**
 * Tests for useSorobanContract — Soroban RPC simulation.
 * All RPC calls are mocked so no network is needed.
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import { xdr } from "@stellar/stellar-sdk";

// ── Mock StellarProvider ──────────────────────────────────────────────────────
jest.mock("../context/StellarProvider", () => ({
  useStellarContext: () => ({
    networkConfig: {
      network: "testnet",
      sorobanUrl: "https://soroban-testnet.stellar.org",
      horizonUrl: "https://horizon-testnet.stellar.org",
    },
  }),
}));

// ── Shared mock state ─────────────────────────────────────────────────────────
let mockSimResult: unknown = null;
let mockSimError: Error | null = null;

jest.mock("@stellar/stellar-sdk", () => {
  const actual = jest.requireActual("@stellar/stellar-sdk");

  class MockServer {
    async simulateTransaction() {
      if (mockSimError) throw mockSimError;
      return mockSimResult;
    }
  }

  const MockSorobanRpc = {
    ...actual.SorobanRpc,
    Server: MockServer,
    Api: {
      ...actual.SorobanRpc?.Api,
      isSimulationError: (r: unknown) =>
        typeof r === "object" && r !== null && "error" in r && !("result" in r),
      isSimulationSuccess: (r: unknown) =>
        typeof r === "object" && r !== null && "result" in r,
    },
  };

  return {
    ...actual,
    SorobanRpc: MockSorobanRpc,
  };
});

// Import AFTER mock is set up
import { useSorobanContract } from "./useSorobanContract";

const VALID_CONTRACT_ID = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";

beforeEach(() => {
  mockSimResult = null;
  mockSimError = null;
});

// ── Success tests ─────────────────────────────────────────────────────────────

describe("useSorobanContract — success", () => {
  it("returns decoded data on successful simulation", async () => {
    const retval = xdr.ScVal.scvBool(true);
    mockSimResult = { result: { retval }, cost: {}, latestLedger: 1 };

    const { result } = renderHook(() =>
      useSorobanContract({ contractId: VALID_CONTRACT_ID, method: "get_value" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe(true);
  });

  it("sets data to null when simulation returns no retval", async () => {
    mockSimResult = { result: { retval: undefined }, cost: {}, latestLedger: 1 };

    const { result } = renderHook(() =>
      useSorobanContract({ contractId: VALID_CONTRACT_ID, method: "noop" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

// ── Failure tests ─────────────────────────────────────────────────────────────

describe("useSorobanContract — errors", () => {
  it("sets error when contract ID is invalid", async () => {
    const { result } = renderHook(() =>
      useSorobanContract({ contractId: "INVALID_ID", method: "balance" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.error).toMatch(/Invalid contract ID/);
    expect(result.current.data).toBeNull();
  });

  it("sets error on RPC simulation error response", async () => {
    mockSimResult = { error: "contract not found" };

    const { result } = renderHook(() =>
      useSorobanContract({ contractId: VALID_CONTRACT_ID, method: "balance" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.error).toMatch(/RPC simulation error/);
    expect(result.current.data).toBeNull();
  });

  it("sets error when RPC throws a network error", async () => {
    mockSimError = new Error("Network error");

    const { result } = renderHook(() =>
      useSorobanContract({ contractId: VALID_CONTRACT_ID, method: "balance" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.error).toBe("Network error");
    expect(result.current.data).toBeNull();
  });

  it("does not call RPC when contractId is empty", async () => {
    const { result } = renderHook(() =>
      useSorobanContract({ contractId: "", method: "balance" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it("does not call RPC when method is empty", async () => {
    const { result } = renderHook(() =>
      useSorobanContract({ contractId: VALID_CONTRACT_ID, method: "" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.data).toBeNull();
  });
});
