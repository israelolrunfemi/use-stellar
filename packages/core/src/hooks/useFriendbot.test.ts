import { renderHook, act } from "@testing-library/react-hooks";
import { StellarProvider } from "../context/StellarProvider";
import { useFriendbot } from "./useFriendbot";

const VALID_ADDRESS = "G" + "A".repeat(55);

describe("useFriendbot", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <StellarProvider network="testnet">{children}</StellarProvider>
  );

  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).fetch;
  });

  it("funds valid testnet G address", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hash: "test-hash" }),
    });

    (global as any).fetch = fetchMock;

    const { result } = renderHook(() => useFriendbot(), { wrapper });

    await act(async () => {
      await result.current.fund(VALID_ADDRESS);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(VALID_ADDRESS)}`
    );
    expect(result.current.funded).toBe(true);
    expect(result.current.hash).toBe("test-hash");
    expect(result.current.error).toBeNull();
  });

  it("blocks mainnet use with clear error", async () => {
    const mainnetWrapper = ({ children }: { children: React.ReactNode }) => (
      <StellarProvider network="mainnet">{children}</StellarProvider>
    );

    const { result } = renderHook(() => useFriendbot(), {
      wrapper: mainnetWrapper,
    });

    await act(async () => {
      await result.current.fund(VALID_ADDRESS);
    });

    expect(result.current.error).toBe(
      "Friendbot funding is only available on testnet."
    );
    expect(result.current.funded).toBe(false);
  });

  it("returns a helpful message when address is missing", async () => {
    const { result } = renderHook(() => useFriendbot(), { wrapper });

    await act(async () => {
      await result.current.fund();
    });

    expect(result.current.error).toBe(
      "No Stellar address provided. Connect a wallet or pass a G... address."
    );
    expect(result.current.funded).toBe(false);
  });
});
