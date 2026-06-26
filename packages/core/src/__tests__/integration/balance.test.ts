import { Keypair, Server } from "@stellar/stellar-sdk";

// Increase timeout to 60 seconds to allow for network requests and ledger closures
jest.setTimeout(60000);

describe("Integration: Balance", () => {
  const server = new Server("https://horizon-testnet.stellar.org");

  it("should fund an account via friendbot and verify the balance", async () => {
    // 1. Generate a new keypair
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();

    // 2. Fund the account using Friendbot
    const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    expect(response.ok).toBe(true);

    // 3. Call Horizon directly to get the balance
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find((b) => b.asset_type === "native");

    // Friendbot currently funds accounts with 10,000 XLM
    expect(nativeBalance).toBeDefined();
    expect(parseFloat(nativeBalance!.balance)).toBeGreaterThanOrEqual(10000);
  });
});