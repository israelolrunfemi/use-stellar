/**
 * @jest-environment node
 */
import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Asset,
  Operation,
} from "@stellar/stellar-sdk"

jest.setTimeout(120000) // 2 minutes, as we have to fund twice and submit a tx

describe("Integration: Payment Flow", () => {
  const server = new Horizon.Server("https://horizon-testnet.stellar.org")

  it("should successfully send 10 XLM from account A to account B", async () => {
    // 1. Generate keypairs for Alice and Bob
    const alice = Keypair.random()
    const bob = Keypair.random()

    // 2. Fund both accounts via Friendbot
    await fetch(`https://friendbot.stellar.org?addr=${alice.publicKey()}`)
    await fetch(`https://friendbot.stellar.org?addr=${bob.publicKey()}`)

    // 3. Verify Bob's initial balance
    let bobAccount = await server.loadAccount(bob.publicKey())
    const initialBalanceObj = bobAccount.balances.find(
      (b: { asset_type: string; balance: string }) => b.asset_type === "native"
    )
    const initialBalance = parseFloat(initialBalanceObj!.balance)

    // 4. Build and submit the payment transaction from Alice
    const aliceAccount = await server.loadAccount(alice.publicKey())
    const fee = await server.fetchBaseFee()

    const transaction = new TransactionBuilder(aliceAccount, {
      fee: fee.toString(),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: bob.publicKey(),
          asset: Asset.native(),
          amount: "10",
        })
      )
      .setTimeout(30)
      .build()

    transaction.sign(alice)
    const txResult = await server.submitTransaction(transaction)
    expect(txResult.successful).toBe(true)

    // 5. Verify Bob's balance increased by 10 XLM
    bobAccount = await server.loadAccount(bob.publicKey())
    const finalBalanceObj = bobAccount.balances.find(
      (b: { asset_type: string; balance: string }) => b.asset_type === "native"
    )
    const finalBalance = parseFloat(finalBalanceObj!.balance)

    expect(finalBalance).toBeCloseTo(initialBalance + 10, 5)
  })
})
