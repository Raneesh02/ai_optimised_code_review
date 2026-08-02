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

**Step 2 — Check checkpoint `.claude/automate-test.state.json`:**
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

**Step 1B — DOM inspection via dom-inspector agent**

Spawn an Agent with `subagent_type: "dom-inspector"`. The prompt must include:
- The target URL
- A plain-English description of every interactive element referenced in the test cases, including any state-triggering interactions needed to expose conditional elements (e.g. "fill email with 'notanemail' then click Send to reveal the email format error")
- `outputFile: .claude/automate-test-locators.json`

After the agent finishes, **ignore its text response entirely**. Instead, read `.claude/automate-test-locators.json` using the Read tool and parse the JSON array from that file.

**Boundary rule — enforced, no exceptions:**
- The dom-inspector agent owns ALL DOM work: navigation, snapshots, interactions, and `data-test` queries.
- The main pipeline must NEVER navigate, snapshot, click, fill, or evaluate JavaScript on the page — not as a fallback, not to "just check one thing".
- If `.claude/automate-test-locators.json` does not exist after the agent returns, **stop immediately**. Report: `"Phase 1 blocked — dom-inspector did not write output file. Re-run after fixing the agent."`
- If the file contains any entry with `"selector": "MISSING"`, **stop immediately**. Report: `"Phase 1 blocked — dom-inspector could not resolve: [locatorName, ...]`. Fix the agent and re-run.`" Do not proceed to Phase 2.

Store the parsed array as your locator list for Phase 2.

> CHECKPOINT — write state before proceeding:
> Update `.claude/automate-test.state.json`: set `lastPhase: 1`.

Report: "Phase 1 complete — [found existing PO / discovered N elements via DOM inspection]"

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

> CHECKPOINT — write state before proceeding:
> Update `.claude/automate-test.state.json`: set `lastPhase: 2`, append `pages/<feature>.page.ts` and `fixtures/index.ts` to `filesWritten`.

Report: "Phase 2 complete — created/patched pages/<feature>.page.ts + updated fixtures/index.ts"

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

> CHECKPOINT — write state before proceeding:
> Update `.claude/automate-test.state.json`: set `lastPhase: 3`, append `tests/<feature>/<feature>.spec.ts` to `filesWritten`.

Report: "Phase 3 complete — created/updated tests/<feature>/<feature>.spec.ts with N tests"

---

## Phase 4 — Code Review

Spawn an Agent with `subagent_type: "code-review-fixer"`. The prompt must include:
- The absolute paths of every file written in Phases 2–3 (page object, spec file, fixtures/index.ts if patched)
- The path `.claude/code_guidelines.md`
- `outputFile: .claude/automate-test-review.txt`

After the agent finishes, **ignore its text response entirely**. Instead, read `.claude/automate-test-review.txt` using the Read tool.

**Boundary rule — enforced, no exceptions:**
- The code-review-fixer agent owns ALL review and inline fix work.
- The main pipeline must NEVER read, edit, or patch files as a fallback if this agent fails.
- If `.claude/automate-test-review.txt` does not exist after the agent returns, **stop immediately**. Report: `"Phase 4 blocked — code-review-fixer did not write output file. Re-run after fixing the agent."`

> CHECKPOINT — write state before proceeding:
> Update `.claude/automate-test.state.json`: set `lastPhase: 4`.

Report: "Phase 4 complete — [summary from .claude/automate-test-review.txt]"

---

## Phase 5 — Test Execution

Run:
```
npx playwright test tests/<feature>/<feature>.spec.ts --reporter=list
```

**All pass**: Update `.claude/automate-test.state.json`: set `lastPhase: 5`. Then report "Phase 5 complete — all N tests passed."

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
