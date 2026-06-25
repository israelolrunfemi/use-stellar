import React, { type ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import {
  getNetworkDetails,
  isConnected,
  requestAccess,
} from "@stellar/freighter-api";
import { StellarProvider } from "../context/StellarProvider";
import { NETWORK_PASSPHRASES } from "../wallets";
import { useWallet } from "./useWallet";

jest.mock("@stellar/freighter-api", () => ({
  getNetworkDetails: jest.fn(),
  isConnected: jest.fn(),
  requestAccess: jest.fn(),
  signTransaction: jest.fn(),
}));

const mockIsConnected = jest.mocked(isConnected);
const mockRequestAccess = jest.mocked(requestAccess);
const mockGetNetworkDetails = jest.mocked(getNetworkDetails);

const wrapper = ({ children }: { children: ReactNode }) => (
  <StellarProvider>{children}</StellarProvider>
);

describe("useWallet", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("keeps connect freighter backward compatible", async () => {
    mockIsConnected.mockResolvedValue({ isConnected: true });
    mockRequestAccess.mockResolvedValue({ address: "GABC" });
    mockGetNetworkDetails.mockResolvedValue({
      network: "TESTNET",
      networkUrl: "https://horizon-testnet.stellar.org",
      networkPassphrase: NETWORK_PASSPHRASES.testnet,
    });

    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connect("freighter");
    });

    expect(result.current.connected).toBe(true);
    expect(result.current.address).toBe("GABC");
    expect(result.current.wallet).toBe("freighter");
    expect(result.current.walletName).toBe("Freighter");
    expect(result.current.error).toBeNull();
  });

  it("sets a typed unsupported-wallet message without breaking state", async () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connect("rabet");
    });

    expect(result.current.connected).toBe(false);
    expect(result.current.wallet).toBeNull();
    expect(result.current.error).toBe("Rabet is not supported yet.");
  });
});
