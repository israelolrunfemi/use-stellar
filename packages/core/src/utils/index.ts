import { Horizon } from "@stellar/stellar-sdk";
import type { Asset, Balance, NetworkConfig, StellarNetwork } from "../types";
import { NETWORK_CONFIGS } from "../types";

// ── Environment helpers ───────────────────────────────────────────────────
/** Returns `true` only when running in a browser (not Node / SSR). */
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ── Network helpers ────────────────────────────────────────────────────────
export function getNetworkConfig(network: StellarNetwork): NetworkConfig {
  return NETWORK_CONFIGS[network];
}

export function getHorizonServer(network: StellarNetwork): Horizon.Server {
  return new Horizon.Server(NETWORK_CONFIGS[network].horizonUrl);
}

// ── Asset helpers ──────────────────────────────────────────────────────────
export function isNativeAsset(asset: Asset): asset is "XLM" {
  return asset === "XLM";
}

export function formatAssetCode(asset: Asset): string {
  return isNativeAsset(asset) ? "XLM" : asset.code;
}

export function parseHorizonBalance(
  raw: Horizon.HorizonApi.BalanceLine
): Balance {
  if (raw.asset_type === "native") {
    return {
      asset:   "XLM",
      balance: raw.balance,
    };
  }

  const issued = raw as Horizon.HorizonApi.BalanceLineAsset;
  return {
    asset: {
      code:   issued.asset_code,
      issuer: issued.asset_issuer,
    },
    balance: issued.balance,
    limit:   issued.limit,
  };
}

// ── Address helpers ────────────────────────────────────────────────────────
export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(address);
}

export function shortenAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// ── Amount helpers ─────────────────────────────────────────────────────────
export function formatAmount(amount: string, decimals = 7): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return "0";
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

export * from "./errorParser";