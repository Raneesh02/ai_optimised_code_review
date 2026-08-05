---
name: review-code
description: >
  Reviews code changes, pull requests, or specific files against the project coding guidelines.
  Triggers when the user asks to "review code", "check standards", or explicitly invokes `/review-code`.
---

Given one or more code files or a diff, you must analyze them thoroughly against the project's official coding guidelines defined in [code_guidelines.md](file:///Users/raneeshchoudhary/projects/ai_code_review_demo/code_guidelines.md) and generate a structured Code Review report.

## Review Checkpoints

Evaluate the code against these five categories:

### 1. 🔴 Critical / Security
- **Credentials:** Look for hardcoded credentials (emails, passwords, API tokens) in the code.
- **Environment Configuration:** Ensure all secrets and environment-specific configs are read from environment variables or `.env` file. Ensure `.env` is never committed.

### 2. 🟠 Architecture & Imports
- Verify compliance with the **Page Object Pattern** and **Fixture Encapsulation** rules in [code_guidelines.md](file:///Users/raneeshchoudhary/projects/ai_code_review_demo/code_guidelines.md).
- Ensure new page objects extend `BasePage` and are registered as custom Playwright fixtures.
- Flag any manual page object instantiations (e.g. `new CartPage(page)`) inside tests.

### 3. 🟡 Selectors & Wait Patterns
- Check that the **Banned Patterns** and **Selector Priority** rules from [code_guidelines.md](file:///Users/raneeshchoudhary/projects/ai_code_review_demo/code_guidelines.md) are strictly followed.
- Check for banned selectors (XPath, raw CSS classes, inline locator queries in tests) and banned wait patterns (e.g., `page.waitForTimeout()`).

### 4. 🟡 Test Conventions
- Check compliance with the **Test Conventions** rules in [code_guidelines.md](file:///Users/raneeshchoudhary/projects/ai_code_review_demo/code_guidelines.md).
- Verify that every test starts with a Jira/Test ID prefix, includes the `@regression` tag, and has custom assertion messages for every `expect()`.

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
