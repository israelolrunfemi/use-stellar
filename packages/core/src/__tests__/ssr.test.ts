/**
 * @jest-environment node
 *
 * Verifies that importing use-stellar in a pure Node environment
 * (no window / DOM) does not crash — the key requirement for SSR
 * in Next.js, Remix, and similar frameworks.
 */

describe("SSR safety — import in Node environment", () => {
  it("can import StellarProvider without crashing", () => {
    expect(() => require("../context/StellarProvider")).not.toThrow()
  })

  it("can import useWallet without crashing", () => {
    expect(() => require("../hooks/useWallet")).not.toThrow()
  })

  it("can import useBalance without crashing", () => {
    expect(() => require("../hooks/useBalance")).not.toThrow()
  })

  it("can import useAccount without crashing", () => {
    expect(() => require("../hooks/useAccount")).not.toThrow()
  })

  it("can import useSendPayment without crashing", () => {
    expect(() => require("../hooks/useSendPayment")).not.toThrow()
  })

  it("can import useTransaction without crashing", () => {
    expect(() => require("../hooks/useTransaction")).not.toThrow()
  })

  it("can import useNetwork without crashing", () => {
    expect(() => require("../hooks/useNetwork")).not.toThrow()
  })

  it("can import useAsset without crashing", () => {
    expect(() => require("../hooks/useAsset")).not.toThrow()
  })

  it("can import useSorobanContract without crashing", () => {
    expect(() => require("../hooks/useSorobanContract")).not.toThrow()
  })

  it("can import the barrel index without crashing", () => {
    expect(() => require("../index")).not.toThrow()
  })

  it("isBrowser() returns false in Node", () => {
    const { isBrowser } = require("../utils")
    expect(isBrowser()).toBe(false)
  })
})
