# pw-framework — Project Context

## Project
Playwright TypeScript learning project. Target: `https://practicesoftwaretesting.com`.  
Base URL via `process.env.BASE_URL` (dotenv, `.env` at root). Default fallback: same URL.

---

## Directory Structure

| Dir | Purpose |
|-----|---------|
| `pages/` | Page objects — one file per page, extends `BasePage` |
| `tests/` | Specs grouped by feature: `cart/`, `checkout/`, `product/` |
| `fixtures/` | `index.ts` exports all custom fixtures + `expect` |
| `common_actions/` | Cross-page flows — `ShopFacade` |
| `data/` | `products.ts` → `PRODUCTS`, `users.ts` → `USERS` |
| `utils/` | Low-level helpers (`loginViaUI`, `parseCurrency`, etc.) |

---

## Available Fixtures

Always import from `../../fixtures` — never from `@playwright/test` directly:

```ts
import { test, expect } from '../../fixtures';
```

| Fixture | Type |
|---------|------|
| `homePage` | `HomePage` |
| `cartPage` | `CartPage` |
| `checkoutPage` | `CheckoutPage` |
| `productPage` | `ProductPage` |
| `shopFacade` | `ShopFacade` — cross-page flows |

---

## Coding Standards

Full conventions in `.claude/code_guidelines.md`. Key rules:

- Selector priority: `data-test` > `id` > ARIA role — no CSS/xpath
- No assertions inside page objects
- No `page.waitForTimeout()` — use locator waits
- Test naming: ID prefix (`C01 action outcome @regression`)
- AAA structure — `beforeEach` for nav/auth, test owns its data
- Extract helpers only at 3+ usages (rule of three)

Skills that need full detail should `@.claude/code_guidelines.md` directly.

---

## Auth

`tests/auth.setup.ts` runs once, saves `auth.json` via `storageState`.  
Single role: `USERS.customer`. Tests that need auth inherit it via config — no manual login in tests.

---

## Runner Config (`playwright.config.ts`)

- `retries: 0` — no retries locally
- `timeout: 15000` — 15s per test
- Browser: Chromium only
- `trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'`
- Reporters: `html` + `list`
