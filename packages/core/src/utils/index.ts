import { Horizon } from "@stellar/stellar-sdk"
import type { Asset, Balance, NetworkConfig, StellarNetwork, IssuedAsset } from "../types"
import { NETWORK_CONFIGS } from "../types"

// ── Environment helpers ───────────────────────────────────────────────────
/** Returns `true` only when running in a browser (not Node / SSR). */
export function isBrowser(): boolean {
  return typeof window !== "undefined"
}

// ── Network helpers ────────────────────────────────────────────────────────
export function getNetworkConfig(network: StellarNetwork): NetworkConfig {
  return NETWORK_CONFIGS[network]
}

export function getHorizonServer(network: StellarNetwork): Horizon.Server {
  return new Horizon.Server(NETWORK_CONFIGS[network].horizonUrl)
}

// ── Asset helpers ──────────────────────────────────────────────────────────
export function isNativeAsset(asset: Asset): asset is "XLM" {
  return asset === "XLM"
}

export function isIssuedAsset(asset: Asset): asset is IssuedAsset {
  return typeof asset === "object" && "code" in asset
}

export function formatAssetCode(asset: Asset): string {
  if (isNativeAsset(asset)) return "XLM"
  if (isIssuedAsset(asset)) return asset.code
  return asset // "liquidity_pool_shares"
}

/**
 * Validates whether an asset code follows Stellar naming conventions.
 *
 * @param code - The asset code to validate
 * @returns True if the code is valid (1-12 alphanumeric characters), false otherwise
 */
export function isValidAssetCode(code: string): boolean {
  return /^[a-zA-Z0-9]{1,12}$/.test(code)
}

/**
 * Parses a raw Horizon balance line into a standard Balance object.
 *
 * @param raw - The raw balance line from Horizon API.
 * @returns The parsed Balance object.
 */
export function parseHorizonBalance(raw: Horizon.HorizonApi.BalanceLine): Balance {
  if (raw.asset_type === "native") {
    return {
      asset: "XLM",
      balance: raw.balance,
    }
  }

  if (raw.asset_type === "liquidity_pool_shares") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lp = raw as any
    return {
      asset: "liquidity_pool_shares",
      balance: lp.balance,
      liquidityPoolId: lp.liquidity_pool_id,
    } as Balance
  }

  const issued = raw as Horizon.HorizonApi.BalanceLineAsset
  return {
    asset: {
      code: issued.asset_code,
      issuer: issued.asset_issuer,
    },
    balance: issued.balance,
    limit: issued.limit,
  }
}

// ── Address helpers ────────────────────────────────────────────────────────
/**
 * Validates whether a string is a valid Stellar public key address.
 *
 * @param address - The address to validate
 * @returns True if the address is a valid Stellar address, false otherwise
 */
export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(address)
}

export function shortenAddress(address: string, chars = 6): string {
  if (!address) return ""
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

// ── Amount helpers ─────────────────────────────────────────────────────────
export function formatAmount(amount: string, decimals = 7): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return "0"
  return num.toFixed(decimals).replace(/\.?0+$/, "")
}
