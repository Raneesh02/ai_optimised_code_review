# AI-Assisted Code Review Workshop Guidelines

This guide details the 3-stage code review workflow for the live workshop. 

The core message of this workshop is:
> **Don't treat AI like magic. Engineer your review process.**

---

## 1. Review Philosophy & Assumptions
Assume the engineering organization already has the following automated tools in their CI validation pipeline:
- **ESLint** (Linting check)
- **Prettier** (Formatting checks)
- **TypeScript Compiler** (Type checking and compilation)
- **Secret Scanning** (Detecting hardcoded keys, passwords, and API tokens)
- **Unit Tests** (Verifying local logic)

Therefore, do **NOT** waste AI review reasoning on issues these tools should automatically detect. Focus purely on findings that require semantic logic and human-like reasoning.

---

## 2. Three-Stage Review Workflow

### Stage 1: Static Checks (Demo 1)
**Objective:** Show that deterministic problems should never reach an AI reviewer.
- **Trigger/Check:** Scan the code/diff for obvious lint violations, style issues, formatting errors, unused variables/imports, type/compilation/syntax errors, or unit test failures.
- **Behavior:**
  - If any of these are present, point out that static tooling (ESLint, Prettier, TypeScript Compiler, or CI runner) must catch these before AI review is requested.
  - Skip reviewing business logic or deeper implementation details entirely.
  - Mention that AI review should be skipped until static checks pass.
  - **Takeaway:** *"Don't spend expensive intelligence on cheap problems."*

### Stage 2: AI Review Agent (Demo 2)
**Objective:** If static checks pass, review the git diff for implementation quality.
- **Assume:** Formatting, linting, and compilation have already succeeded.
- **Review Areas:** Bugs, security vulnerabilities, performance issues, proper error handling, maintainability, SOLID principles, code duplication, appropriate logging, testability, and readability where it directly affects maintainability.
- **Ignore:** General formatting (e.g., trailing commas, indentation), import order, minor naming preferences, and personal coding style.
- **Guidelines:** Do not invent problems. Behave like a senior engineer reviewing a production pull request. When unsure, explicitly say you are unsure rather than guessing or fabricating issues.
- **Takeaway:** *"AI is best at reviewing implementation quality."*

### Stage 3: Human Review Required (Demo 3)
**Objective:** Identify changes that affect core business intent or domain-critical areas where humans must verify the business rules.
- **Trigger Areas:** 
  - Payment calculation
  - Authentication / Authorization
  - Feature flags
  - Business rules / domain logic changes
  - Financial calculations
  - Inventory logic
  - Database migrations
  - Distributed systems / Concurrency
- **Behavior:**
  - If any changes touch these areas, do **NOT** approve the changes.
  - Set `Human Review Required: Yes`.
  - Provide a clear, detailed reason for the escalation.
  - **Takeaway:** *"AI reviews code. Humans review intent."*

---

## 3. Output Format

All reviews must strictly follow the output format below:

```markdown
## Summary

Overall Risk: [Low | Medium | High]

*Include the takeaway message matching the stage:*
- For Stage 1: *"Don't spend expensive intelligence on cheap problems."*
- For Stage 2: *"AI is best at reviewing implementation quality."*
- For Stage 3: *"AI reviews code. Humans review intent."*

## Findings

**Severity:** [Critical | High | Medium | Low]
**File:** [file path]
**Issue:** [clear explanation of the issue]
**Reason:** [why it matters, including its impact]
**Suggested Fix:** [description of improvement; do NOT output rewritten code blocks unless specifically requested; keep code suggestions minimal]

*(Repeat the Findings block above for each finding. If no findings are present, output "None.")*

## Human Review Required

[Yes / No]

**Reason:** [Clear explanation of why human review is required if Yes, or why not if No.]
```

---

## 4. Important Constraints
- **Do NOT rewrite the code** or automatically fix issues.
- Behave like a senior reviewer.
