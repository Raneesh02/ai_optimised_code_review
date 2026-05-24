---
name: automate-test
description: >
  Full 5-phase test automation pipeline. Reads a test-case markdown file and produces
  a page object, spec file, code review pass, and verified test run.
  Triggered by /automate-test <path-to-test-case-file>.
---

You are executing a 5-phase test automation pipeline for a Playwright TypeScript project.
The user invoked `/automate-test <file>`. `<file>` is the path to a test case markdown doc.

## Pre-flight

**Step 1 — Parse the test case file:**
- Feature name (from heading)
- Target URL or path (from file header comments or scenario steps)
- All test case IDs (C01, C02…) and their scenarios

**Step 2 — Probe Playwright MCP:**
Call `mcp__playwright__browser_navigate` with URL `about:blank`.
- Succeeds → continue.
- Fails → abort immediately: "Playwright MCP unavailable — start it and retry. Aborting."

**Step 3 — Check checkpoint `.claude/automate-test.state.json`:**
- Not found → proceed fresh.
- Found → compare `sourceFile` and `testCaseIds` against current invocation:
  - **Same file + same IDs + `lastPhase === 5`** → report "Already fully automated — N/N tests in tests/<feature>/<feature>.spec.ts. Nothing to do." Stop.
  - **Same file + same IDs + `lastPhase < 5`** → report "Resuming from Phase <lastPhase + 1>." Skip all phases ≤ `lastPhase`.
  - **Different file or different IDs** → delete `.claude/automate-test.state.json`, proceed fresh.

Before Phase 1 starts, create `.claude/automate-test.state.json`:
```json
{ "sourceFile": "<arg>", "testCaseIds": ["C01",...], "feature": "<feature>", "lastPhase": 0, "filesWritten": [] }
```

Report one line: "Automating N tests for [Feature] at [URL]" — then start Phase 1 (or resume).

---

## Phase 1 — Page Object Discovery

**Step 1A — Codebase check**

Search `pages/` for a file matching the feature (e.g. `contact.page.ts` for Contact).
- Found and complete: read it, note locators and methods. Report what exists. Proceed to Phase 3.
- Found but incomplete (missing locators needed for the test cases): note gaps, proceed to Phase 2 to patch.
- Not found: proceed to Step 1B.

**Step 1B — DOM inspection via Playwright MCP**

1. Use `mcp__playwright__browser_navigate` to open the target URL.
2. Use `mcp__playwright__browser_snapshot` to capture the accessibility tree.
3. For each element referenced in the test cases, identify its best selector:
   - Priority: `data-test` attribute > `id` > ARIA role. Never CSS class or xpath.
4. Build a list: `{ locatorName, selector, selectorType }` for every interactive element needed.

Report: "Phase 1 complete — [found existing PO / discovered N elements via DOM inspection]"

Update `.claude/automate-test.state.json`: set `lastPhase: 1`.

---

## Phase 2 — Page Object Creation or Patch

Skip entirely if Phase 1A found a complete, sufficient page object.

**Create `pages/<feature>.page.ts`** (or patch existing):

```ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class <Feature>Page extends BasePage {
  readonly <locatorName>: Locator;
  // ... one readonly per element

  constructor(page: Page) {
    super(page);
    this.<locatorName> = page.locator('[data-test="..."]');
    // prefer getByRole / getByLabel for elements without data-test
  }

  async navigate() {
    await this.page.goto('/<path>');
  }

  // Add methods ONLY for multi-step interactions (2+ steps that belong together).
  // Single-step wrappers are banned. No assertions inside this class.
}
```

**Register the fixture in `fixtures/index.ts`** (skip if fixture already exists):

1. Add import: `import { <Feature>Page } from '../pages/<feature>.page';`
2. Add to `TestFixtures` type: `<feature>Page: <Feature>Page;`
3. Add initializer inside `base.extend`:
   ```ts
   <feature>Page: async ({ page }, use) => {
     await use(new <Feature>Page(page));
   },
   ```

Report: "Phase 2 complete — created/patched pages/<feature>.page.ts + updated fixtures/index.ts"

Update `.claude/automate-test.state.json`: set `lastPhase: 2`, append `pages/<feature>.page.ts` and `fixtures/index.ts` to `filesWritten`.

---

## Phase 3 — Spec File Creation

Read `.claude/code_guidelines.md` now if not already read.

**Determine spec path**: `tests/<feature>/<feature>.spec.ts`
- File exists: scan for the highest test ID (C01, C02…) present, continue numbering from there.
- File missing: create it.

**Spec template**:

```ts
import { test, expect } from '../../fixtures'; // NEVER from @playwright/test
// import data constants if strings map to something in data/

test.describe('<Feature>', () => {
  test.beforeEach(async ({ <feature>Page }) => {
    await <feature>Page.navigate();
  });

  test('C01 <action> <outcome> @regression', async ({ <feature>Page }) => {
    // Arrange — only if state setup is needed beyond beforeEach
    // Act
    // Assert — every expect must include a descriptive message
    await expect(<feature>Page.<locator>, '<what this check proves>').toBeVisible();
  });
});
```

**Enforced rules while writing**:
- Import only from `../../fixtures` — never `@playwright/test`
- Every test name ends with `@regression` — no exceptions
- Every `expect(...)` call takes a message as second argument
- No `page.waitForTimeout()` anywhere — use locator waits with `{ timeout }`
- `beforeEach` owns navigation; each test owns its own data
- Test IDs sequential per file; scan existing file before assigning

Report: "Phase 3 complete — created/updated tests/<feature>/<feature>.spec.ts with N tests"

Update `.claude/automate-test.state.json`: set `lastPhase: 3`, append `tests/<feature>/<feature>.spec.ts` to `filesWritten`.

---

## Phase 4 — Code Review

Review every file created or modified in Phases 2–3 against `.claude/code_guidelines.md`.
Fix violations inline — do not just list them.

**Page object checklist**:
- Extends `BasePage`
- All locators declared `readonly` at class level (not inline in methods)
- Selector priority respected: `data-test` > `id` > ARIA role
- Zero `expect` calls inside the class
- Methods only for multi-step interactions

**Spec file checklist**:
- Imports from `../../fixtures`, not `@playwright/test`
- Every test name has `@regression`
- Every `expect` has an assertion message
- No `waitForTimeout` calls
- `beforeEach` handles navigation
- No shared mutable state across tests (no `let` assignments that bleed between tests)
- AAA structure is clear

After fixing: re-run the checklist mentally once to confirm all items pass.

Report: "Phase 4 complete — [N violations found and fixed / all checks passed]"

Update `.claude/automate-test.state.json`: set `lastPhase: 4`.

---

## Phase 5 — Test Execution

Run:
```
npx playwright test tests/<feature>/<feature>.spec.ts --reporter=list
```

**All pass**: Report "Phase 5 complete — all N tests passed." Update `.claude/automate-test.state.json`: set `lastPhase: 5`.

**Any fail**:
1. Read failure output in full.
2. Identify root cause — selector mismatch, timing, wrong assertion value, missing await, etc.
3. Fix in the appropriate file.
4. Run once more:
   ```
   npx playwright test tests/<feature>/<feature>.spec.ts --reporter=list
   ```
5. Report final state: passed or still failing with root cause.

Do not attempt a third run. If still failing after one fix, stop and report the failure and diagnosis clearly for user review.

---

## Final Output

One line per phase, then a total:

```
Phase 1: [summary]
Phase 2: [summary]
Phase 3: [summary]
Phase 4: [summary]
Phase 5: [summary]
---
Result: N/N tests passing in tests/<feature>/<feature>.spec.ts
```
