# Framework Review — Senior SDET

> Reviewed: 2026-05-16 | Framework: Playwright + TypeScript

---

## 🔴 Critical

| Location | Problem | Fix |
|---|---|---|
| `data/users.ts` | Credentials hardcoded in repo | Move to `.env` or secrets manager |
| `.env` | Verify not committed to git | Confirm `.gitignore` excludes `.env`; rotate if exposed |
| `cart.page.ts:30` | Fragile delete-icon selector via regex + positional fallback | Use `data-testid` on delete button |
| `checkout.spec.ts:35` | Inline selector diverges from `CheckoutPage` page object definition | Use page object method exclusively; dual-maintenance hazard |

---

## 🟠 Architecture

| Location | Problem | Fix |
|---|---|---|
| `playwright.config.ts:9` | `retries: 0` — no flake recovery | Set `retries: 1` (CI), `0` (local) via `process.env.CI` |
| `playwright.config.ts:18-24` | Chromium-only — no Firefox/WebKit | Add browser projects for cross-browser coverage |
| `playwright.config.ts:13` | `baseURL` hardcoded fallback in config | Use `BASE_URL` env var, no fallback — force explicit config |
| `playwright.config.ts:8` | `fullyParallel: true` with no worker cap | Add `workers` limit or per-project isolation |

---

## 🟡 Selectors

| Location | Problem | Fix |
|---|---|---|
| `home.page.ts:47` | `.locator('generic').last()` — unsemantic | Replace with `data-testid` or role selector |
| `home.page.ts:18` | `[class*="card"]` — partial class match, fragile to refactor | Use `data-testid` |
| `checkout.page.ts:68` | Context-dependent scoped button selector | Use `data-testid` |
| `cart.page.ts:16` | Complex `hasNot` filter obscures intent | Extract to reusable named method |

---

## 🟡 Tests

| Location | Problem | Fix |
|---|---|---|
| `playwright.config.ts:10` | 15s global timeout too low for checkout flows | Increase to 30-45s or set per-test overrides |
| `cart.spec.ts:63` | `waitForTimeout(500)` — hardcoded sleep | Replace with `page.waitForFunction()` or state-based wait |
| `cart.spec.ts:33-34` | `press('Tab')` to trigger update — implicit behavior | Use `.blur()` explicitly; add comment explaining why |
| `cart.spec.ts:5` | `itemName` mutated in `beforeEach` — fragile | Pass via fixture |
| `checkout.spec.ts:30` | Loose regex assertion for success message | Assert single canonical success message |
| `checkout.spec.ts:67-78` | Duplicated checkout flow | Extract to shared helper |
| `product.spec.ts:42` | `.toHaveURL(/\/product\//)` too broad | Assert exact product ID in URL |

---

## 🟡 Config & DX

| Location | Problem | Fix |
|---|---|---|
| `tsconfig.json:10` | `**/*.ts` include too broad | Explicit paths: `pages/**`, `fixtures/**`, `utils/**`, `data/**`, `tests/**` |
| `package.json:6` | Test script hardcodes `--grep "C01"` | Remove or make configurable via `GREP` env var |
| `playwright.config.ts:1-2` | `devices` imported but unused | Remove import |
| `utils/helpers.ts:4-12` | Skeleton wait duplicates inline selector from page objects | Consolidate into `ProductPage` method |
| `fixtures/index.ts` | No fixture teardown/cleanup hooks | Add cleanup: logout, cart clear |
| `package.json:10` | Setup script re-runs login unconditionally | Check `auth.json` exists before running setup |

---

## Strengths

- Page Object Model consistently applied across all pages
- Fixtures properly typed with strict TypeScript and custom `test` extension
- Data separated into modules (`users`, `products`) — enables reuse
- Role-based selectors (`getByRole`, `getByLabel`) used as primary strategy
- Test coverage spans happy path, validation, and error scenarios

---

## Priority Order

1. Rotate any exposed credentials immediately
2. Add `.env` to `.gitignore`, move all credentials out of source
3. Fix `checkout.spec.ts:35` selector divergence from page object
4. Replace `waitForTimeout` with proper waits
5. Add retries config for CI
6. Add `data-testid` attributes to fragile selectors (coordinate with dev team)
7. Add cross-browser projects
