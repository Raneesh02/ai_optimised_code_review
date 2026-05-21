# pw-framework — Coding Standards

## Page Object Pattern

Reference file: `pages/cart.page.ts`

- Extends `BasePage` — `constructor(readonly page: Page)`
- All locators: `readonly` class properties
- Selector priority: **`data-test` > `id` > ARIA role** — no CSS classes, no xpath
- No assertions inside page objects — pure interaction only
- Methods only for multi-step interactions
- Class name: `[Name]Page`, named export

---

## Test Conventions

**Naming:** ID prefix style — `C01 add product appears in cart`  
**Tags:** Every test gets `@regression`. No exceptions.

```ts
test('C01 add product appears in cart @regression', ...)
```

**Assertions:** Multiple `expect` OK when testing one logical behaviour.  
**Assertion messages:** Always include a message:

```ts
await expect(rows, 'cart should show 1 item after add').toHaveCount(1);
```

**Structure (AAA):** Arrange / Act / Assert. `beforeEach` handles navigation and auth setup — each test owns its own data.

**DRY rule:** Extract to helper or fixture only when used 3+ times (rule of three).

---

## Banned Patterns

| Pattern | Replace with |
|---------|-------------|
| `page.waitForTimeout()` | Explicit locator waits with `{ timeout }` |
| Hardcoded strings in tests | Constants from `data/products.ts` or `data/users.ts` |
| Assertions inside page objects | Move all `expect` into test files |
| CSS class selectors | `data-test` attr or ARIA role |
| xpath | `data-test` attr or ARIA role |

---

## Test IDs

IDs (C01, C02...) are scoped per feature file and map to Jira tickets.  
When writing new tests: scan existing file for highest ID, increment by 1.

---

## Flaky Test Policy

Fix root cause immediately. Flaky tests block merge — no exceptions.  
If Claude writes a step that may be timing-sensitive, add a comment:

```ts
// NOTE: waitForLoadState may be flaky under slow network — watch in CI
```
