# pw-framework Workspace Rules

All code written or modified in this repository must adhere to the following rules. These rules are automatically loaded by Antigravity for all operations.

## Page Object Pattern
- **Base Class:** All page objects (except `BasePage`) must extend `BasePage` and pass `page` to `super(page)`.
- **Properties:** Define all locators as `readonly` class properties in the `constructor`.
- **Selector Priority:** `data-test` attributes > `id` > ARIA roles. Never use CSS classes or xpath.
- **Pure Interaction:** Never place assertions (`expect`) inside page objects. They must only contain interaction and helper methods.
- **Methods:** Define methods only for multi-step interactions. Keep page object APIs clean and focused.
- **Naming & Export:** Class names must be `[Name]Page` and use named exports (e.g. `export class CartPage`).

## Test Conventions
- **Naming Format:** Every test must start with a Jira/Test ID prefix and include the `@regression` tag.
  - Example: `test('C01 add product appears in cart @regression', async ({ ... }) => { ... })`
- **Assertion Messages:** Every `expect` statement must include a custom explanation message.
  - Example: `await expect(rows, 'cart should show 1 item after add').toHaveCount(1);`
- **Structure (AAA):** Arrange / Act / Assert. Use `beforeEach` hooks for shared navigation and authentication/setup. Ensure each test is self-contained regarding the data it owns/creates.
- **Rule of Three (DRY):** Only extract code to helper functions or fixtures if it is duplicated in 3 or more places.
- **Fixture Encapsulation:** Tests must always use custom Playwright fixtures (e.g., `{ homePage, cartPage }` from `../../fixtures`) instead of manually instantiating page objects inside tests (`new HomePage(page)`).
- **Navigation:** Use the page object's `navigate()` method (which inherits from `BasePage` and handles `networkidle` state) rather than calling raw `page.goto()` inside tests.

## Banned Patterns
- **Banned:** `page.waitForTimeout()`
  - **Replace with:** Explicit locator waits with `{ timeout }` or state-based waits (e.g., `await expect(locator).toBeVisible({ timeout: 5000 })`).
- **Banned:** Hardcoded strings in tests (e.g. product names, prices, emails).
  - **Replace with:** Import constants from `data/products.ts` or `data/users.ts`.
- **Banned:** CSS class-based or xpath selectors.
  - **Replace with:** `data-test` attributes or ARIA roles.
- **Banned:** Inline locator queries inside test specs (e.g., `page.locator('[data-test="add-to-cart"]')` or `page.getByRole(...)`). Every element interaction must go through a Page Object property or method to maintain separation of concerns.

## Flaky Test Policy
- Fix root cause immediately. Do not skip or silence flaky tests unless absolutely quarantined.
- If writing a step that is potentially timing-sensitive, add a comment flag:
  `// NOTE: waitForLoadState may be flaky under slow network — watch in CI`
