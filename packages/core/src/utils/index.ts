import { Horizon } from "@stellar/stellar-sdk"
import type { Asset, Balance, NetworkConfig, StellarNetwork } from "../types"
import { NETWORK_CONFIGS } from "../types"

// ── Environment helpers ───────────────────────────────────────────────────
/** Returns `true` only when running in a browser (not Node / SSR). */
export function isBrowser(): boolean {
  return typeof window !== "undefined"
}

// ── Network helpers ────────────────────────────────────────────────────────
/**
 * Retrieves the configuration details for a given Stellar network.
 *
 * @param network - The network to get configuration for (e.g., "testnet", "mainnet").
 * @returns The network configuration.
 */
export function getNetworkConfig(network: StellarNetwork): NetworkConfig {
  return NETWORK_CONFIGS[network]
}

/**
 * Creates and returns a Horizon server instance for the specified network.
 *
 * @param network - The Stellar network.
 * @returns A Horizon server instance.
 */
export function getHorizonServer(network: StellarNetwork): Horizon.Server {
  return new Horizon.Server(NETWORK_CONFIGS[network].horizonUrl)
}

// ── Asset helpers ──────────────────────────────────────────────────────────
/**
 * Type guard to check if an asset is the native XLM asset.
 *
 * @param asset - The asset to check.
 * @returns True if the asset is XLM, false otherwise.
 */
export function isNativeAsset(asset: Asset): asset is "XLM" {
  return asset === "XLM"
}

/**
 * Returns a string representation of an asset's code (e.g., "XLM" or "USDC").
 *
 * @param asset - The asset.
 * @returns The asset code.
 */
export function formatAssetCode(asset: Asset): string {
  return isNativeAsset(asset) ? "XLM" : asset.code
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
 * Validates whether a string is a valid Stellar public key address.
 *
 * @param address - The address to validate
 * @returns True if the address is a valid Stellar address, false otherwise
 */
export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(address)
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
    const lpBalance = raw as unknown as { balance: string; liquidity_pool_id: string }
    return {
      asset: "liquidity_pool_shares",
      balance: lpBalance.balance,
      liquidityPoolId: lpBalance.liquidity_pool_id,
    }
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
 * Validates whether a given string is a valid Stellar public address.
 *
 * @param address - The address string to validate.
 * @returns True if valid, false otherwise.
 */
export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(address)
}

/**
 * Shortens a Stellar address for display purposes (e.g., "GABCDE...123456").
 *
 * @param address - The full Stellar address.
 * @param chars - The number of characters to show at the start and end (default: 6).
 * @returns The shortened address.
 */
export function shortenAddress(address: string, chars = 6): string {
  if (!address) return ""
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

// ── Amount helpers ─────────────────────────────────────────────────────────
/**
 * Formats an amount string to a specified number of decimal places, stripping trailing zeros.
 *
 * @param amount - The amount string to format.
 * @param decimals - Maximum number of decimal places (default: 7).
 * @returns The formatted amount string.
 */
export function formatAmount(amount: string, decimals = 7): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return "0"
  return num.toFixed(decimals).replace(/\.?0+$/, "")
}
