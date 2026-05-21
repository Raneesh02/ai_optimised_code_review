# Project CLAUDE.md Intake — Project Context Builder

Answer these questions. Claude uses your answers to generate a `CLAUDE.md` for this specific project — so it knows structure, conventions, and patterns without exploring the repo.

Skip any question that doesn't apply. One-line answers are fine.

---

## 1. Project Identity

**1.1** What is this project? (product name, type, what it tests)

```
Your answer:
```

**1.2** What is the practice/target site or app under test?

```
Your answer: (e.g. https://practicesoftwaretesting.com, internal staging URL)
```

**1.3** Is there a `.env` or environment variable that sets the base URL?

```
Your answer: (e.g. BASE_URL=https://staging.example.com)
```

---

## 2. Directory Structure

**2.1** Where do page objects live? Any naming convention?

```
Your answer: (e.g. pages/ — one file per page, PascalCase.page.ts)
```

**2.2** Where do test specs live? How are they organized?

```
Your answer: (e.g. tests/ — grouped by feature: cart/, checkout/, product/)
```

**2.3** Where do fixtures live? What file exports them?

```
Your answer: (e.g. fixtures/index.ts — exports all custom fixtures)
```

**2.4** Any shared flows or action helpers (cross-page sequences)?

```
Your answer: (e.g. common_actions/ — shopFacade.ts for addToCartAndGoToCart)
```

**2.5** Where does test data live? (constants, factories, fixtures)

```
Your answer: (e.g. data/products.ts exports PRODUCTS, data/users.ts exports USERS)
```

**2.6** Any other top-level dirs Claude should know about?

```
Your answer: (e.g. utils/ — helper functions, mocks/)
```

---

## 3. Page Object Pattern

**3.1** What's the reference page object file Claude should follow as a template?

```
Your answer: (e.g. pages/cart.page.ts)
```

**3.2** How are page objects constructed?

```
[ ] Constructor receives `page: Page`
[ ] Constructor receives a fixture object
[ ] Static methods only (no constructor)
[ ] Other:
```

**3.3** How are locators defined?

```
[ ] readonly class properties
[ ] Getter methods
[ ] Returned inline from methods
[ ] Other:
```

**3.4** Selector priority in this project?

```
Your answer: (e.g. data-test attr > ARIA role > text > CSS)
```

**3.5** Are assertions allowed inside page objects?

```
[ ] No — page objects are pure interaction, no assertions
[ ] Yes — page objects include assertion helpers
[ ] Mixed — some assertion helpers allowed
```

**3.6** Any naming conventions for page object classes or methods?

```
Your answer: (e.g. class CartPage, methods: addItem(), removeItem())
```

---

## 4. Test Conventions

**4.1** What's the test naming pattern?

```
Your answer: (e.g. should [outcome] when [condition])
```

**4.2** How do tests import fixtures?

```
Your answer: (e.g. import { cartPage, shopFacade } from '../../fixtures')
```

**4.3** Any banned patterns — things Claude must never write in tests?

```
Your answer: (e.g. no page.waitForTimeout(), no assertions inside page objects, no hardcoded selectors)
```

**4.4** Preferred assertion style?

```
[ ] One expect per test
[ ] Multiple expects OK if testing one behaviour
[ ] Soft assertions (expect.soft)
[ ] It depends
```

**4.5** Any test tags or annotation conventions? (e.g. `@smoke`, `test.skip`, `test.fixme`)

```
Your answer:
```

---

## 5. Auth & Setup

**5.1** How does authentication work in tests?

```
Your answer: (e.g. auth.setup.ts runs once and saves storageState — tests inherit it)
```

**5.2** Any global setup or teardown files Claude should know about?

```
Your answer: (e.g. global-setup.ts seeds DB, global-teardown.ts cleans up)
```

**5.3** Are there multiple user roles / auth states?

```
Your answer: (e.g. admin.json, customer.json in .auth/)
```

---

## 6. Config Files

**6.1** Where is the Playwright config?

```
Your answer: (e.g. playwright.config.ts at project root)
```

**6.2** Any notable config: retries, workers, reporter, projects (browser matrix)?

```
Your answer:
```

**6.3** Any `.env` files or env loading (dotenv, cross-env)?

```
Your answer:
```

---

## 7. Key Reference Files

**7.1** Which file best shows the page object pattern?

```
Your answer:
```

**7.2** Which test file best shows the test style?

```
Your answer:
```

**7.3** Any files Claude should read before generating anything in this project?

```
Your answer:
```

---

## 8. What Claude Gets Wrong in This Project

**8.1** What does Claude typically generate wrong for this project? (wrong imports, wrong patterns, wrong structure)

```
Your answer:
```

**8.2** Any project-specific gotchas or constraints Claude needs to know?

```
Your answer: (e.g. never use CSS selectors — app has no stable class names, always use data-test)
```

**8.3** Anything Claude should never do in this codebase?

```
Your answer:
```

---

## Generate Your Project CLAUDE.md

Once you've filled this in, run:

```
Use my answers in project-claude-intake.md to generate a CLAUDE.md for this project.
```

Claude will produce a project-scoped `CLAUDE.md` covering structure, conventions, and patterns — no repo exploration needed.
