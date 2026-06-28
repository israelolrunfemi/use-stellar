module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: [
    '**/*.test.ts',
    '**/*.test.tsx'
  ],
  setupFilesAfterEnv: [
    '@testing-library/jest-dom'
  ],
  moduleNameMapper: {
    '^@stellar/stellar-sdk$': '<rootDir>/src/__mocks__/@stellar/stellar-sdk.ts'
  },
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};