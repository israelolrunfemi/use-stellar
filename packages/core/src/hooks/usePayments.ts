import { useState, useEffect, useCallback, useRef } from "react";
import { useStellarContext } from "../context/StellarProvider";
import { getHorizonServer } from "../utils";
import type { UsePaymentsOptions, UsePaymentsReturn, NormalizedPayment, Asset } from "../types";
import type { Horizon } from "@stellar/stellar-sdk";

export function usePayments({
  address,
  limit = 10,
  order = "desc",
  cursor,
}: UsePaymentsOptions = {}): UsePaymentsReturn {
  const { network, wallet } = useStellarContext();
  const resolvedAddress = address ?? wallet.address;

  const [payments, setPayments] = useState<NormalizedPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store page navigation functions from the Horizon response
  const nextRef = useRef<(() => Promise<Horizon.ServerApi.CollectionPage<any>>) | null>(null);
  const prevRef = useRef<(() => Promise<Horizon.ServerApi.CollectionPage<any>>) | null>(null);

  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!resolvedAddress) {
      setPayments([]);
      setHasNext(false);
      setHasPrev(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const server = getHorizonServer(network);
      let query = server.payments().forAccount(resolvedAddress).limit(limit).order(order);
      if (cursor) {
        query = query.cursor(cursor);
      }

      const res = await query.call();
      const normalized = res.records.map(rec => normalizePayment(rec, resolvedAddress));
      setPayments(normalized);

      // Save pagination callbacks
      nextRef.current = res.records.length > 0 ? () => res.next() : null;
      prevRef.current = res.records.length > 0 ? () => res.prev() : null;

      setHasNext(res.records.length >= limit);
      setHasPrev(!!cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch payment history");
    } finally {
      setLoading(false);
    }
  }, [resolvedAddress, network, limit, order, cursor]);

  const fetchNext = useCallback(async () => {
    if (!nextRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await nextRef.current();
      const normalized = res.records.map(rec => normalizePayment(rec, resolvedAddress!));
      setPayments(normalized);

      nextRef.current = res.records.length > 0 ? () => res.next() : null;
      prevRef.current = res.records.length > 0 ? () => res.prev() : null;

      setHasNext(res.records.length >= limit);
      setHasPrev(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch next page");
    } finally {
      setLoading(false);
    }
  }, [resolvedAddress, limit]);

  const fetchPrev = useCallback(async () => {
    if (!prevRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await prevRef.current();
      const normalized = res.records.map(rec => normalizePayment(rec, resolvedAddress!));
      setPayments(normalized);

      nextRef.current = res.records.length > 0 ? () => res.next() : null;
      prevRef.current = res.records.length > 0 ? () => res.prev() : null;

      setHasNext(true);
      setHasPrev(res.records.length >= limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch previous page");
    } finally {
      setLoading(false);
    }
  }, [resolvedAddress, limit]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    refetch: fetchPayments,
    fetchNext,
    fetchPrev,
    hasNext,
    hasPrev,
  };
}

// ── Normalize Payment Operations ───────────────────────────────────────────
function normalizePayment(
  record: any,
  address: string
): NormalizedPayment {
  const type = record.type;
  const id = record.id;
  const txHash = record.transaction_hash;
  const createdAt = record.created_at;

  let from = "";
  let to = "";
  let amount = "0";
  let asset: Asset = "XLM";
  let direction: "incoming" | "outgoing" = "outgoing";

  if (type === "payment") {
    from = record.from;
    to = record.to;
    amount = record.amount;
    asset = record.asset_type === "native"
      ? "XLM"
      : { code: record.asset_code!, issuer: record.asset_issuer! };
    direction = to === address ? "incoming" : "outgoing";
  } else if (type === "create_account") {
    from = record.funder;
    to = record.account;
    amount = record.starting_balance;
    asset = "XLM";
    direction = to === address ? "incoming" : "outgoing";
  } else if (type === "account_merge") {
    from = record.account || record.source_account;
    to = record.into;
    amount = record.amount || "0";
    asset = "XLM";
    direction = to === address ? "incoming" : "outgoing";
  } else if (type === "path_payment_strict_receive" || type === "path_payment_strict_send") {
    from = record.from;
    to = record.to;
    direction = to === address ? "incoming" : "outgoing";

    if (direction === "incoming") {
      amount = record.amount;
      asset = record.asset_type === "native"
        ? "XLM"
        : { code: record.asset_code!, issuer: record.asset_issuer! };
    } else {
      amount = record.source_amount || record.amount;
      const srcAssetType = record.source_asset_type || record.asset_type;
      asset = srcAssetType === "native"
        ? "XLM"
        : {
            code: record.source_asset_code || record.asset_code!,
            issuer: record.source_asset_issuer || record.asset_issuer!
          };
    }
  }

  return {
    id,
    txHash,
    type,
    from,
    to,
    amount,
    asset,
    direction,
    createdAt,
  };
}
