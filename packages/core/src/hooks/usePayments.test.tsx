import React from "react";
import { renderHook, act } from "@testing-library/react";
import { StellarProvider } from "../context/StellarProvider";
import { usePayments } from "./usePayments";

const mockCall = jest.fn();
const mockNext = jest.fn();
const mockPrev = jest.fn();

jest.mock("@stellar/stellar-sdk", () => {
  const original = jest.requireActual("@stellar/stellar-sdk");
  return {
    ...original,
    Horizon: {
      Server: jest.fn().mockImplementation(() => ({
        payments: jest.fn().mockReturnThis(),
        forAccount: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        cursor: jest.fn().mockReturnThis(),
        call: mockCall,
      })),
    },
  };
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <StellarProvider network="testnet">
    {children}
  </StellarProvider>
);

describe("usePayments", () => {
  const address = "G_TARGET";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles empty state and returns empty array", async () => {
    mockCall.mockResolvedValueOnce({ records: [] });

    const { result } = renderHook(() => usePayments({ address }), { wrapper });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.payments).toEqual([]);
    expect(result.current.hasNext).toBe(false);
    expect(result.current.hasPrev).toBe(false);
  });

  it("normalizes native XLM payment operations", async () => {
    const rawRecords = [
      {
        id: "100",
        type: "payment",
        transaction_hash: "tx_1",
        created_at: "2026-06-25T18:00:00Z",
        from: "G_SENDER",
        to: address,
        amount: "10.5",
        asset_type: "native",
      },
    ];

    mockCall.mockResolvedValueOnce({ records: rawRecords });

    const { result } = renderHook(() => usePayments({ address }), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.payments).toHaveLength(1);
    expect(result.current.payments[0]).toEqual({
      id: "100",
      txHash: "tx_1",
      type: "payment",
      from: "G_SENDER",
      to: address,
      amount: "10.5",
      asset: "XLM",
      direction: "incoming",
      createdAt: "2026-06-25T18:00:00Z",
    });
  });

  it("normalizes issued asset payments correctly", async () => {
    const rawRecords = [
      {
        id: "101",
        type: "payment",
        transaction_hash: "tx_2",
        created_at: "2026-06-25T18:01:00Z",
        from: address,
        to: "G_RECEIVER",
        amount: "500.0",
        asset_type: "credit_alphanum4",
        asset_code: "USDC",
        asset_issuer: "G_ISSUER",
      },
    ];

    mockCall.mockResolvedValueOnce({ records: rawRecords });

    const { result } = renderHook(() => usePayments({ address }), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.payments).toHaveLength(1);
    expect(result.current.payments[0]).toEqual({
      id: "101",
      txHash: "tx_2",
      type: "payment",
      from: address,
      to: "G_RECEIVER",
      amount: "500.0",
      asset: { code: "USDC", issuer: "G_ISSUER" },
      direction: "outgoing",
      createdAt: "2026-06-25T18:01:00Z",
    });
  });

  it("handles create_account and account_merge operations as native payments", async () => {
    const rawRecords = [
      {
        id: "102",
        type: "create_account",
        transaction_hash: "tx_3",
        created_at: "2026-06-25T18:02:00Z",
        funder: "G_SENDER",
        account: address,
        starting_balance: "1.5",
      },
      {
        id: "103",
        type: "account_merge",
        transaction_hash: "tx_4",
        created_at: "2026-06-25T18:03:00Z",
        account: address,
        into: "G_RECEIVER",
        amount: "2.5",
      },
    ];

    mockCall.mockResolvedValueOnce({ records: rawRecords });

    const { result } = renderHook(() => usePayments({ address }), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.payments).toHaveLength(2);
    expect(result.current.payments[0].type).toBe("create_account");
    expect(result.current.payments[0].direction).toBe("incoming");
    expect(result.current.payments[0].asset).toBe("XLM");

    expect(result.current.payments[1].type).toBe("account_merge");
    expect(result.current.payments[1].direction).toBe("outgoing");
    expect(result.current.payments[1].asset).toBe("XLM");
  });

  it("handles pagination via fetchNext and fetchPrev", async () => {
    const page1 = {
      records: [
        {
          id: "200",
          type: "payment",
          transaction_hash: "tx_p1",
          created_at: "2026-06-25T18:10:00Z",
          from: "G_SENDER",
          to: address,
          amount: "1.0",
          asset_type: "native",
        },
      ],
      next: mockNext,
      prev: mockPrev,
    };

    const page2 = {
      records: [
        {
          id: "201",
          type: "payment",
          transaction_hash: "tx_p2",
          created_at: "2026-06-25T18:11:00Z",
          from: "G_SENDER",
          to: address,
          amount: "2.0",
          asset_type: "native",
        },
      ],
      next: mockNext,
      prev: mockPrev,
    };

    mockCall.mockResolvedValueOnce(page1);
    mockNext.mockResolvedValueOnce(page2);

    const { result } = renderHook(() => usePayments({ address, limit: 1 }), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.payments[0].id).toBe("200");
    expect(result.current.hasNext).toBe(true);

    // Fetch next page
    await act(async () => {
      await result.current.fetchNext();
    });

    expect(result.current.payments[0].id).toBe("201");
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("handles errors gracefully", async () => {
    mockCall.mockRejectedValueOnce(new Error("Network Error"));

    const { result } = renderHook(() => usePayments({ address }), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network Error");
    expect(result.current.payments).toEqual([]);
  });
});
