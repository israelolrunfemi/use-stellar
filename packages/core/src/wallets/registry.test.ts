import { getWalletAdapter } from "./registry"

describe("wallet adapter registry", () => {
  it("returns the supported Freighter adapter", () => {
    const adapter = getWalletAdapter("freighter")

    expect(adapter.metadata).toEqual({
      type: "freighter",
      name: "Freighter",
      supported: true,
    })
  })

  it("returns typed unsupported adapters for known future wallets", async () => {
    const adapter = getWalletAdapter("albedo")

    expect(adapter.metadata.supported).toBe(false)
    await expect(adapter.connect("testnet")).rejects.toMatchObject({
      code: "wallet_unsupported",
      message: "Albedo is not supported yet.",
    })
  })
})
