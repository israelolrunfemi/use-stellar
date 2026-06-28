import { renderHook } from "@testing-library/react";
import React           from "react";
import { StellarProvider } from "./StellarProvider";
import { useNetwork }      from "../hooks/useNetwork";

// ── Wrapper helpers ────────────────────────────────────────────────────────

function makeWrapper(props: Omit<React.ComponentProps<typeof StellarProvider>, "children">) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(StellarProvider, { ...props, children });
  };
}

// ── Default config ─────────────────────────────────────────────────────────

describe("StellarProvider — default config", () => {
  it("uses testnet as the default network", () => {
    const { result } = renderHook(() => useNetwork(), {
      wrapper: makeWrapper({}),
    });

    expect(result.current.network).toBe("testnet");
    expect(result.current.isTestnet).toBe(true);
    expect(result.current.isMainnet).toBe(false);
  });

  it("resolves the built-in SDF testnet endpoints when no override is given", () => {
    const { result } = renderHook(() => useNetwork(), {
      wrapper: makeWrapper({ network: "testnet" }),
    });

    expect(result.current.networkConfig.horizonUrl).toBe(
      "https://horizon-testnet.stellar.org"
    );
    expect(result.current.networkConfig.sorobanUrl).toBe(
      "https://soroban-testnet.stellar.org"
    );
    expect(result.current.networkConfig.network).toBe("testnet");
  });

  it("resolves the built-in SDF mainnet endpoints when network='mainnet'", () => {
    const { result } = renderHook(() => useNetwork(), {
      wrapper: makeWrapper({ network: "mainnet" }),
    });

    expect(result.current.networkConfig.horizonUrl).toBe(
      "https://horizon.stellar.org"
    );
    expect(result.current.networkConfig.sorobanUrl).toBe(
      "https://soroban.stellar.org"
    );
    expect(result.current.networkConfig.network).toBe("mainnet");
    expect(result.current.isMainnet).toBe(true);
    expect(result.current.isTestnet).toBe(false);
  });
});

// ── Custom config ──────────────────────────────────────────────────────────

describe("StellarProvider — custom networkConfig", () => {
  const CUSTOM_HORIZON = "https://horizon.my-node.example.com";
  const CUSTOM_SOROBAN = "https://rpc.my-node.example.com";

  it("exposes custom horizonUrl via useNetwork()", () => {
    const { result } = renderHook(() => useNetwork(), {
      wrapper: makeWrapper({
        network: "mainnet",
        networkConfig: { horizonUrl: CUSTOM_HORIZON, sorobanUrl: CUSTOM_SOROBAN },
      }),
    });

    expect(result.current.networkConfig.horizonUrl).toBe(CUSTOM_HORIZON);
  });

  it("exposes custom sorobanUrl via useNetwork()", () => {
    const { result } = renderHook(() => useNetwork(), {
      wrapper: makeWrapper({
        network: "mainnet",
        networkConfig: { horizonUrl: CUSTOM_HORIZON, sorobanUrl: CUSTOM_SOROBAN },
      }),
    });

    expect(result.current.networkConfig.sorobanUrl).toBe(CUSTOM_SOROBAN);
  });

  it("preserves the network name in the resolved config", () => {
    const { result } = renderHook(() => useNetwork(), {
      wrapper: makeWrapper({
        network: "mainnet",
        networkConfig: { horizonUrl: CUSTOM_HORIZON, sorobanUrl: CUSTOM_SOROBAN },
      }),
    });

    expect(result.current.networkConfig.network).toBe("mainnet");
    expect(result.current.isMainnet).toBe(true);
  });

  it("works with custom testnet endpoints too", () => {
    const CUSTOM_TESTNET_HORIZON = "https://horizon.private-testnet.example.com";
    const CUSTOM_TESTNET_SOROBAN = "https://rpc.private-testnet.example.com";

    const { result } = renderHook(() => useNetwork(), {
      wrapper: makeWrapper({
        network: "testnet",
        networkConfig: {
          horizonUrl: CUSTOM_TESTNET_HORIZON,
          sorobanUrl: CUSTOM_TESTNET_SOROBAN,
        },
      }),
    });

    expect(result.current.networkConfig.horizonUrl).toBe(CUSTOM_TESTNET_HORIZON);
    expect(result.current.networkConfig.sorobanUrl).toBe(CUSTOM_TESTNET_SOROBAN);
    expect(result.current.isTestnet).toBe(true);
  });

  it("trims whitespace from custom URLs", () => {
    const { result } = renderHook(() => useNetwork(), {
      wrapper: makeWrapper({
        network: "mainnet",
        networkConfig: {
          horizonUrl: "  https://horizon.my-node.example.com  ",
          sorobanUrl: "  https://rpc.my-node.example.com  ",
        },
      }),
    });

    expect(result.current.networkConfig.horizonUrl).toBe(CUSTOM_HORIZON);
    expect(result.current.networkConfig.sorobanUrl).toBe(CUSTOM_SOROBAN);
  });
});

// ── Invalid config ─────────────────────────────────────────────────────────

describe("StellarProvider — invalid networkConfig", () => {
  // Suppress React's error boundary console output during these tests
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it("throws when horizonUrl is missing", () => {
    expect(() =>
      renderHook(() => useNetwork(), {
        wrapper: makeWrapper({
          network: "mainnet",
          // @ts-expect-error — intentionally testing runtime validation
          networkConfig: { sorobanUrl: "https://rpc.my-node.example.com" },
        }),
      })
    ).toThrow(/horizonUrl is required/);
  });

  it("throws when sorobanUrl is missing", () => {
    expect(() =>
      renderHook(() => useNetwork(), {
        wrapper: makeWrapper({
          network: "mainnet",
          // @ts-expect-error — intentionally testing runtime validation
          networkConfig: { horizonUrl: "https://horizon.my-node.example.com" },
        }),
      })
    ).toThrow(/sorobanUrl is required/);
  });

  it("throws when horizonUrl is an empty string", () => {
    expect(() =>
      renderHook(() => useNetwork(), {
        wrapper: makeWrapper({
          network: "mainnet",
          networkConfig: {
            horizonUrl: "",
            sorobanUrl: "https://rpc.my-node.example.com",
          },
        }),
      })
    ).toThrow(/horizonUrl is required/);
  });

  it("throws when sorobanUrl is a blank string", () => {
    expect(() =>
      renderHook(() => useNetwork(), {
        wrapper: makeWrapper({
          network: "mainnet",
          networkConfig: {
            horizonUrl: "https://horizon.my-node.example.com",
            sorobanUrl: "   ",
          },
        }),
      })
    ).toThrow(/sorobanUrl is required/);
  });

  it("error message includes a usage hint", () => {
    expect(() =>
      renderHook(() => useNetwork(), {
        wrapper: makeWrapper({
          network: "mainnet",
          // @ts-expect-error — intentionally testing runtime validation
          networkConfig: { sorobanUrl: "https://rpc.my-node.example.com" },
        }),
      })
    ).toThrow(/Example:/);
  });
});

// ── useStellarContext outside provider ─────────────────────────────────────

describe("useStellarContext — outside provider", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it("throws a descriptive error when used outside StellarProvider", () => {
    // renderHook with no wrapper — no provider in the tree
    expect(() => renderHook(() => useNetwork())).toThrow(
      /No StellarProvider found/
    );
  });
});
