# AI-Assisted Code Review Demo & Workshop

This repository is designed to demonstrate and teach modern, engineered workflows for **AI-assisted code reviews**. It is geared towards Software Engineers, SDETs, and QA leads looking to optimize code quality assurance and review tooling.

The core philosophy of this project is:
> **"Don't treat AI like magic. Engineer your review process."**

---

## Workshop Structure

The workshop consists of three key demonstrations to showcase where AI fits (and where it does not) in the software development lifecycle:

### 1. Demo 1 – Static Checks Save AI Tokens
- **Objective:** Show that deterministic problems should never reach an AI reviewer.
- **Concept:** Save expensive intelligence for complex problems. Standard issues like linting, formatting, type check compile errors, unused variables, and unit test failures must be handled by static tools in CI.
- **Exercise File:** [cart_static_checks.spec.ts](file:///Users/raneeshchoudhary/projects/ai_code_review_demo/tests/cart/cart_static_checks.spec.ts)
- **Review Takeaway:** *"Don't spend expensive intelligence on cheap problems."*

### 2. Demo 2 – AI Review Agent
- **Objective:** Review implementation quality on the code changes (git diff).
- **Concept:** Focus the AI reviewer on semantic reasoning (bugs, security vulnerabilities, performance, error handling, maintainability, SOLID principles, logging, and testability). Ignore style preferences or formatting.
- **Review Takeaway:** *"AI is best at reviewing implementation quality."*

### 3. Demo 3 – Human Review Required
- **Objective:** Detect changes affecting critical business intent and business logic.
- **Concept:** Identify domain-critical changes (payment logic, authorization, inventory, concurrency, etc.) and flag them for human review.
- **Review Takeaway:** *"AI reviews code. Humans review intent."*

---

## Getting Started

### Prerequisites
Install the project dependencies:
```bash
npm install
```

### Running Tests
Execute the Playwright test suite:
```bash
npx playwright test
```

### Running Type Checks
Verify that TypeScript compiling passes (or fails on the static checks demo):
```bash
npx tsc --noEmit
```

---

## Guidelines File
For detailed instructions on the review stages and response schema formatting, see [workshop_review_instructions.md](file:///Users/raneeshchoudhary/projects/ai_code_review_demo/workshop_review_instructions.md).
