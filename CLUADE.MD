

You are a senior fullstack blockchain enginer with working in the use-stellar monorepo — a React hooks library for
the Stellar network with a Next.js demo app.

Repo layout:
  packages/core/   ← the SDK (published to npm as "use-stellar")
  packages/demo/   ← Next.js demo app

Work in two phases:
  PHASE 1 — Fix every bug. Make the demo run and all tests pass.
  PHASE 2 — Make packages/core npm-publishable to production standard.

Do not produce a commit. Work top-to-bottom through every item below.

══════════════════════════════════════════════════════════════
PHASE 1 — BUG FIXES (work through every item before Phase 2)
══════════════════════════════════════════════════════════════

────────────────────────────────────────────
BUG 1 — Jest config typo: setupFilesAfterFramework
File: packages/core/package.json
────────────────────────────────────────────

The jest config key "setupFilesAfterFramework" does not exist.
The correct key is "setupFilesAfterEnv".
Because of this typo, @testing-library/jest-dom matchers are never
registered. Any test using toBeInTheDocument() or similar will throw
"TypeError: expect(...).toBeInTheDocument is not a function".

Fix:
  WRONG:   "setupFilesAfterFramework": ["@testing-library/jest-dom"]
  CORRECT: "setupFilesAfterEnv":       ["@testing-library/jest-dom"]

────────────────────────────────────────────
BUG 2 — useSendPayment: redundant dynamic import shadows static import
File: packages/core/src/hooks/useSendPayment.ts
────────────────────────────────────────────

Inside the send() try block there is:

  const { TransactionBuilder: TB } = await import("@stellar/stellar-sdk");
  const signed = TB.fromXDR(signedTxXdr, networkPass);

TransactionBuilder is already statically imported at the top of the
file. The dynamic import re-imports the entire Stellar SDK at runtime
inside a hot path, adds bundle weight, and introduces async latency.

Fix: remove the dynamic import entirely and use the already-imported
TransactionBuilder directly:

  const signed = TransactionBuilder.fromXDR(signedTxXdr, networkPass);

────────────────────────────────────────────
BUG 3 — useWallet: stale wallet closure in connect()
File: packages/core/src/hooks/useWallet.ts
────────────────────────────────────────────

connect() spreads the stale wallet snapshot from the closure:

  setWallet({ ...wallet, connecting: true, error: null });

When called in React StrictMode or when wallet state has just changed,
this overwrites the current state with stale data. The canonical React
fix is to use the functional updater form so React always applies the
update to the current state:

  setWallet(prev => ({ ...prev, connecting: true, error: null }));

Apply the same functional updater pattern to the catch block:

  setWallet(prev => ({
    ...prev,
    connecting: false,
    error: err instanceof Error ? err.message : "Failed to connect wallet",
  }));

Also remove "wallet" from the useCallback dependency array.
The new deps array should be: [setWallet, network]

────────────────────────────────────────────
BUG 4 — useBalance: fetchBalances missing from useEffect deps
File: packages/core/src/hooks/useBalance.ts
────────────────────────────────────────────

fetchBalances is defined as a plain async function inside the component
body and called from useEffect, but it is not listed in the deps array.
This violates the rules-of-hooks and causes stale-closure bugs when
resolvedAddress or network change while a fetch is in-flight.

Fix: convert fetchBalances to a useCallback and add it to useEffect deps:

  const fetchBalances = useCallback(async () => {
    if (!resolvedAddress) return;
    setLoading(true);
    setError(null);
    try {
      const server  = getHorizonServer(network);
      const account = await server.loadAccount(resolvedAddress);
      const parsed  = account.balances.map(parseHorizonBalance);
      setBalances(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  }, [resolvedAddress, network]);

  useEffect(() => {
    fetchBalances();
    if (watch) {
      const interval = setInterval(fetchBalances, 10_000);
      return () => clearInterval(interval);
    }
  }, [fetchBalances, watch]);

Add useCallback to the imports from "react".

────────────────────────────────────────────
BUG 5 — useAccount: fetchAccount missing from useEffect deps
File: packages/core/src/hooks/useAccount.ts
────────────────────────────────────────────

Same pattern as BUG 4. Apply the same useCallback fix:

  const fetchAccount = useCallback(async () => {
    // ... existing body unchanged
  }, [resolvedAddress, network]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

Add useCallback to the react import.

────────────────────────────────────────────
BUG 6 — useTransaction: interval captures stale `transaction` closure
File: packages/core/src/hooks/useTransaction.ts
────────────────────────────────────────────

The interval callback captures the value of `transaction` from the
closure at the time useEffect runs (always null on first mount). This
makes the early-exit guard dead code — the interval will fire forever
even after the transaction succeeds or fails.

Fix: use a ref to track the latest transaction status so the interval
always sees the current value:

  const transactionRef = useRef<TransactionResult | null>(null);

  // Keep ref in sync every render
  transactionRef.current = transaction;

  // Inside the interval:
  const interval = setInterval(() => {
    const s = transactionRef.current?.status;
    if (s === "success" || s === "failed") return;
    fetchTransaction();
  }, 3000);

Also convert fetchTransaction to useCallback and add it to useEffect deps
(same pattern as BUG 4 / BUG 5):

  const fetchTransaction = useCallback(async () => {
    // ... existing body unchanged
  }, [hash, network]);

  useEffect(() => {
    fetchTransaction();
    if (watch) {
      const interval = setInterval(() => {
        const s = transactionRef.current?.status;
        if (s === "success" || s === "failed") return;
        fetchTransaction();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [fetchTransaction, watch]);

Add useRef and useCallback to the react import.

────────────────────────────────────────────
BUG 7 — useSorobanContract: callContract missing from useEffect deps
File: packages/core/src/hooks/useSorobanContract.ts
────────────────────────────────────────────

Same stale-closure pattern as BUG 4/5/6. Fix identically:

  const callContract = useCallback(async () => {
    // ... existing body unchanged
  }, [contractId, method, networkConfig]);

  useEffect(() => {
    callContract();
  }, [callContract]);

Also note: the current implementation is a stub that does not actually
call the contract. That is documented as a known issue (#10 / #11).
Do NOT try to implement the full Soroban call simulation here.
Preserve the existing stub body and fix only the hook pattern.

────────────────────────────────────────────
BUG 8 — useAsset: homeDomain not mapped from Horizon response
File: packages/core/src/hooks/useAsset.ts
────────────────────────────────────────────

The AssetInfo interface has homeDomain?: string but the setAsset call
omits it, even though Horizon returns raw.home_domain on asset records.

Fix: add the mapping:

  setAsset({
    code:        raw.asset_code,
    issuer:      raw.asset_issuer,
    supply:      raw.amount,
    numAccounts: raw.num_accounts,
    homeDomain:  raw.home_domain,    // ← add this line
    flags: {
      authRequired:  raw.flags.auth_required,
      authRevocable: raw.flags.auth_revocable,
      authImmutable: raw.flags.auth_immutable,
    },
  });

Also convert fetchAsset to useCallback:

  const fetchAsset = useCallback(async () => {
    // ... existing body
  }, [code, issuer, network]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

────────────────────────────────────────────
BUG 9 — useBalance: asset lookup matches by code only
File: packages/core/src/hooks/useBalance.ts
────────────────────────────────────────────

The balance lookup finds the target asset by matching only the asset code:

  const targetCode = formatAssetCode(asset);
  const match = balances.find(b => formatAssetCode(b.asset) === targetCode);

If an account holds two issued assets with the same code but different
issuers (e.g., USDC from two different issuers — not uncommon on testnet),
this will silently return the wrong balance.

Fix: match by both code and issuer for issued assets, keeping the simple
string comparison for XLM:

  const match = balances.find(b => {
    if (asset === "XLM") return b.asset === "XLM";
    if (typeof asset === "object" && typeof b.asset === "object") {
      return b.asset.code === asset.code && b.asset.issuer === asset.issuer;
    }
    return false;
  });

────────────────────────────────────────────
BUG 10 — Demo app: 5 of 8 demo pages are missing
File: packages/demo/app/page.tsx and the missing page files
────────────────────────────────────────────

The home page links to 8 demo routes:
  /demo/wallet      ← exists
  /demo/balance     ← exists
  /demo/network     ← exists
  /demo/account     ← MISSING
  /demo/send        ← MISSING
  /demo/transaction ← MISSING
  /demo/asset       ← MISSING
  /demo/soroban     ← MISSING

Any click on the five missing routes gives a Next.js 404.

Fix: create each missing page. Model them after the existing
packages/demo/app/demo/wallet/page.tsx — same "use client" directive,
same DemoCard wrapper, same inline styling pattern.

Create:

  packages/demo/app/demo/account/page.tsx
    Shows: address, sequence number, subentry count, full balance list.
    Hook used: useAccount()

  packages/demo/app/demo/send/page.tsx
    Shows: destination input, amount input, asset selector (XLM/USDC),
    memo input, Send button, result hash or error.
    Hook used: useSendPayment()
    Note: disable Send button when wallet is not connected; show a
    "Connect wallet first" hint.

  packages/demo/app/demo/transaction/page.tsx
    Shows: hash input, transaction status (pending/success/failed),
    ledger, fee, createdAt.
    Hook used: useTransaction({ hash: input, watch: true })

  packages/demo/app/demo/asset/page.tsx
    Shows: code input, issuer input, Fetch button, asset metadata
    (supply, numAccounts, homeDomain, flags).
    Hook used: useAsset({ code, issuer })

  packages/demo/app/demo/soroban/page.tsx
    Shows: contractId input, method input, Call button, raw result.
    Note: this hook is a stub (tracked in issue #10). Display the
    stub response with a visible notice:
    "⚠ Full Soroban simulation is in progress — tracked in issue #10."
    Hook used: useSorobanContract({ contractId, method })

────────────────────────────────────────────
BUG 11 — useTransaction: missing "not_found" status handling
File: packages/core/src/hooks/useTransaction.ts
────────────────────────────────────────────

TransactionStatus includes "not_found" but it is never set.
A 404 from Horizon sets status to "pending", which conflates
"has not been submitted" with "submitted but not yet in a ledger".

Fix: distinguish them:

  if (is404 && !hash) {
    setTransaction({ hash: hash!, status: "not_found" });
  } else if (is404) {
    setTransaction({ hash: hash!, status: "pending" });
  } else {
    setError(err instanceof Error ? err.message : "Failed to fetch transaction");
  }

Actually the cleaner fix: keep "pending" for the watch case (transaction
submitted, not yet confirmed), and use "not_found" only when hash is
provided but the transaction has never existed:

  if (is404) {
    // Could be pending (submitted, not yet in ledger) or not found.
    // The watch flag determines how to interpret it.
    setTransaction({ hash: hash!, status: watch ? "pending" : "not_found" });
  }

────────────────────────────────────────────
BUG 12 — CI workflow: npm install not frozen
File: .github/workflows/ci.yml
────────────────────────────────────────────

The CI runs "npm install" without --ci, meaning it can silently update
the lockfile in CI, making builds non-reproducible.

Fix: change all three "npm install" steps to "npm ci":

  - run: npm ci

Also add a --cache step for speed:

  - uses: actions/setup-node@v4
    with:
      node-version: "20"
      cache: "npm"

────────────────────────────────────────────
BUG 13 — Root package.json: lint glob broken on non-bash shells
File: package.json
────────────────────────────────────────────

  "lint": "eslint packages/*/src/**/*.ts packages/*/src/**/*.tsx"

The ** glob is shell-expanded before eslint sees it on some platforms,
failing silently on Windows and in some POSIX shells.

Fix: quote the globs and let eslint do the expansion:

  "lint": "eslint \"packages/*/src/**/*.ts\" \"packages/*/src/**/*.tsx\""

Or better, add an .eslintrc config with a root and let eslint discover
files:

  "lint": "eslint packages --ext .ts,.tsx"

Use whichever approach is consistent with the rest of the project.

──────────────────────────────────────────────────────
PHASE 2 — NPM PUBLISH READINESS (after all Phase 1 bugs are fixed)
──────────────────────────────────────────────────────

The goal: running `npm publish` from packages/core should produce a
package that works correctly as both a CJS and ESM import, ships clean
TypeScript declarations, and meets the standard that npm and bundlers
like Vite, webpack, and Next.js expect for a dual-mode library.

────────────────────────────────────────────
NPM 1 — Replace tsc-only build with tsup for dual CJS + ESM output
File: packages/core/package.json and packages/core/tsconfig.json
────────────────────────────────────────────

The current build is "build": "tsc", which only generates CJS output
(module: "commonjs" in tsconfig). The package.json declares:

  "main":   "dist/index.js"    ← CJS ✓ (tsc produces this)
  "module": "dist/index.mjs"   ← ESM ✗ (tsc does NOT produce this)
  "types":  "dist/index.d.ts"  ← types ✓ (tsc produces this)

The .mjs file is never generated, so any bundler using the "module"
field (Vite, Rollup, esbuild) resolves to a file that does not exist.

Fix: replace tsc with tsup.

Add to packages/core devDependencies:
  "tsup": "^8.0.0"

Create packages/core/tsup.config.ts:

  import { defineConfig } from "tsup";

  export default defineConfig({
    entry:      ["src/index.ts"],
    format:     ["cjs", "esm"],
    dts:        true,
    sourcemap:  true,
    clean:      true,
    external:   ["react", "react-dom", "@stellar/stellar-sdk"],
    // treeshaking is on by default in tsup
  });

Update packages/core/package.json build script:
  "build": "tsup"
  "dev":   "tsup --watch"

Update packages/core/package.json output fields:
  "main":    "dist/index.js",
  "module":  "dist/index.mjs",
  "types":   "dist/index.d.ts",
  "exports": {
    ".": {
      "import":  "./dist/index.mjs",
      "require": "./dist/index.js",
      "types":   "./dist/index.d.ts"
    }
  }

Keep tsconfig.json as-is for IDE type-checking. tsup uses its own
esbuild compilation and does not rely on tsconfig for emit.

────────────────────────────────────────────
NPM 2 — Add required npm metadata to packages/core/package.json
────────────────────────────────────────────

The following fields are either missing or need correction.
Add them all:

  "name":        "use-stellar",
  "version":     "0.1.0",
  "description": "React