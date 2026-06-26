// Mock implementation of @stellar/stellar-sdk for testing
// This prevents any real network requests during testing

export const mockAccountRecord = {
  id: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOACCWN',
  sequenceNumber: () => '1234567890123456',
  subentry_count: 2,
  thresholds: {
    low_threshold: 1,
    med_threshold: 2,
    high_threshold: 3,
  },
  signers: [
    {
      key: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOACCWN',
      weight: 1,
      type: 'ed25519_public_key',
    },
  ],
  balances: [
    {
      asset_type: 'native',
      balance: '100.0000000',
    },
    {
      asset_type: 'credit_alphanum4',
      asset_code: 'USDC',
      asset_issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      balance: '250.5000000',
      limit: '1000.0000000',
    },
    {
      asset_type: 'liquidity_pool_shares',
      balance: '50.0000000',
      liquidity_pool_id: 'dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7',
    },
  ],
};

export const mockTransactionRecord = {
  hash: 'abcdef1234567890',
  successful: true,
  ledger: 12345,
  created_at: '2024-01-01T00:00:00Z',
  fee_charged: '100',
};

// Mock server responses
export const mockServerResponses = {
  accountFound: mockAccountRecord,
  accountNotFound: new Error('Request failed with status code 404'),
  transactionFound: mockTransactionRecord,
  transactionNotFound: { response: { status: 404 } },
  networkError: new Error('Network Error'),
};

// Mock Horizon Server
export class MockHorizonServer {
  private shouldThrow: string | null = null;
  
  // Method to configure mock behavior
  mockError(errorType: string | null) {
    this.shouldThrow = errorType;
  }

  async loadAccount(address: string) {
    if (this.shouldThrow === 'accountNotFound') {
      throw mockServerResponses.accountNotFound;
    }
    if (this.shouldThrow === 'networkError') {
      throw mockServerResponses.networkError;
    }
    return mockAccountRecord;
  }

  transactions() {
    const self = this;
    return {
      transaction: (hash: string) => ({
        call: async () => {
          if (self.shouldThrow === 'transactionNotFound') {
            throw mockServerResponses.transactionNotFound;
          }
          if (self.shouldThrow === 'networkError') {
            throw mockServerResponses.networkError;
          }
          return mockTransactionRecord;
        }
      })
    };
  }

  claimableBalances() {
    return {
      claimant: (address: string) => ({
        call: async () => ({
          records: [
            {
              id: '000000000123abc',
              asset: 'native',
              amount: '100.0000000',
              claimants: [
                { 
                  destination: address, 
                  predicate: { unconditional: true } 
                },
              ],
              sponsor: undefined,
            },
          ],
        })
      })
    };
  }
}

// Create singleton mock instance
export const mockHorizonServer = new MockHorizonServer();

// Mock the Horizon namespace
export const Horizon = {
  Server: jest.fn().mockImplementation(() => mockHorizonServer),
  HorizonApi: {},
};

// Mock Keypair for integration tests
export const Keypair = {
  random: jest.fn(() => ({
    publicKey: () => 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOACCWN',
    secret: () => 'SAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOACCWN'
  }))
};

// Export default mock
const stellarSdkMock = {
  Horizon,
  Keypair,
  mockHorizonServer,
  mockServerResponses,
};

export default stellarSdkMock;