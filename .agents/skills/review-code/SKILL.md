---
name: review-code
description: >
  Reviews code changes, pull requests, or specific files against the project coding guidelines.
  Triggers when the user asks to "review code", "check standards", or explicitly invokes `/review-code`.
---

Given one or more code files or a diff, you must analyze them thoroughly against the project's code guidelines and generate a structured Code Review report.

## Review Checkpoints

Evaluate the code against these five categories:

### 1. 🔴 Critical / Security
- **Credentials:** Look for hardcoded credentials (emails, passwords, API tokens) in the code (e.g., `data/users.ts` or inline).
- **Environment Configuration:** Ensure all secrets and environment-specific configs are read from environment variables or `.env` file. Ensure `.env` is never committed.

### 2. 🟠 Architecture & Imports
- **Page Object Base Class:** Check if Page Object classes (located in `pages/`) extend `BasePage` and call `super(page)`.
- **Pure Interaction:** Verify there are absolutely no assertions (`expect` or similar) inside Page Object files.
- **Fixture Imports:** Check if test spec files (located in `tests/`) import `test` and `expect` from the fixtures directory (e.g., `../../fixtures`) instead of directly from `@playwright/test`.
- **No Manual Instantiation:** Flag any occurrences where a test manually instantiates a Page Object (e.g., `new CartPage(page)`). Force dependency injection using Playwright's fixtures.
- **Multi-step methods:** Page object methods should represent multi-step interactions only. Simple element access should be done via `readonly` locator properties.

### 3. 🟡 Selectors & Wait Patterns
- **Banned Wait Patterns:** Look for `page.waitForTimeout()` or arbitrary `sleep` functions. Suggest state-based waits (e.g., `await expect(locator).toBeVisible({ timeout })` or `waitForFunction`) instead.
- **No Inline Selectors in Tests:** Test specs (`.spec.ts`) must never contain raw locator queries (e.g., `page.locator('[data-test="add-to-cart"]')` or `page.getByRole(...)`). Every selector must be defined as a property inside the Page Object.
- **Selector Priority:** Ensure selector strategies follow: `data-test` > `id` > ARIA role. Check for raw CSS classes (e.g., class-based class matches `[class*="card"]`) or xpath selectors, which are banned.
- **Unsemantic Position selectors:** Check for `.first()`, `.last()`, or `.nth()` when a more semantic `data-test` or ARIA role should be used.

### 4. 🟡 Test Conventions
- **Naming & Tags:** Every test must start with a Test ID prefix (e.g. `C01`, `C02`, etc.) and MUST include the `@regression` tag (e.g., `test('C01 adds item to cart @regression', async ({ cartPage }) => { ... })`).
- **Assertion Messages:** Every `expect()` must include a custom user-facing message describing what is being verified (e.g. `await expect(rows, 'cart should contain exactly one item').toHaveCount(1)`).
- **Navigation:** Suggest utilizing the Page Object's `.navigate()` method (which inherits from `BasePage` and handles wait states) instead of raw `page.goto()` inside test spec files.
- **AAA Structure:** Ensure Arrange/Act/Assert blocks are logical. `beforeEach` should only handle navigation and auth setup, with each test owning its own data setup.
- **Rule of Three (DRY):** Do not extract helper utilities or fixtures unless a pattern is repeated 3 or more times.

### 5. 🟡 Configuration & DX
- **Unused imports:** Flag unused imports or variables in config files or specs.
- **Broad TSConfig includes:** Check for overly broad includes like `**/*.ts` in `tsconfig.json`.
- **Hardcoded scripts:** Check if `package.json` scripts contain hardcoded greps or static filters that restrict developer flexibility.

---

## Output Format

Your review response must be structured exactly as follows:

### 1. Code Review Findings Table
Include a table of all identified issues:
| Location | Severity | Problem | Proposed Fix |
|---|---|---|---|
| `file.ts:line` | `🔴 Critical` | Description of issue | Code diff or description of how to fix |

*Note: If no issues are found, state "No style or rule violations detected."*

### 2. Strengths
List the positive aspects of the code (e.g., good page object patterns, proper fixture separation, clean folder layout).

### 3. Priority Action Items
Provide a numbered checklist of action items ordered by severity.
