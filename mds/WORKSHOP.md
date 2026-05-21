# Claude Code for SDETs — Full-Day Workshop

**Duration:** 6–8 hours | **Level:** Mixed (some AI tool experience)  
**Stack:** Playwright TypeScript | **Practice site:** practicesoftwaretesting.com  
**Repo:** this `pw-framework/` directory

---

## Prerequisites

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Verify Playwright runs
npx playwright test

# Add Playwright MCP
claude mcp add playwright

# Verify
claude mcp list
```

All participants need Claude Code Pro or an Anthropic API key.

---

## Architecture Overview

```
~/.claude/                    ← Global (all projects)
  CLAUDE.md                   ← Global instructions
  skills/                     ← Global reusable prompts
  memory/                     ← Persistent cross-session facts

pw-framework/.claude/         ← Project (this repo only)
  CLAUDE.md                   ← Project instructions
  agents/                     ← Subagent definitions
  settings.json               ← Permissions, hooks, env vars
  skills/                     ← Project-scoped skills
```

---

## Schedule

| # | Topic | Duration | Type |
|---|-------|----------|------|
| 0 | Setup & Orientation | 30 min | Core |
| 1 | CLAUDE.md | 45 min | **Core** |
| 2 | Skills + MCP | 60 min | **Core** |
| 3 | Subagents | 45 min | **Core** |
| — | Break | 15 min | — |
| 4 | Hooks + settings.json | 45 min | **Core** |
| — | Lunch | 45 min | — |
| A | Model Selection | 30 min | Optional |
| B | Memory | 30 min | Optional |
| C | Plugins | 45 min | Optional |
| 5 | Capstone | 60 min | Core |
| — | Wrap-up | 15 min | — |

---

## Module 0 — Setup & Orientation (30 min)

**Goal:** Everyone running. Mental model of Claude Code internals established.

### Tour the existing project config

```bash
# What's already configured
cat pw-framework/.claude/settings.local.json

# Existing agent
cat pw-framework/.claude/agents/page-object-finder.md

# Existing skill
cat pw-framework/.claude/skills/explain-test/SKILL.md
```

**Discussion:** Why does `page-object-finder` exist as an agent vs a skill?  
*Answer: Agents run as isolated Claude instances — they protect main context from large search results and can use their own tools/model.*

---

## Module 1 — CLAUDE.md: Instructions & Context (45 min) `CORE`

**Concept:** CLAUDE.md tells Claude WHO you are and HOW to work. Without it, Claude guesses conventions. With it, Claude follows your team's standards by default.

**Demo:** Ask Claude to write a test for the cart page — no CLAUDE.md. Note output style. Then add CLAUDE.md and repeat.

### Exercise 1a — Global SDET persona (15 min)

Global `~/.claude/CLAUDE.md` is NOT a Playwright config. It tells Claude **who you are** — so it can adapt across every project, not just this one.

**What belongs here:** your role, how you think, what you want from Claude, your expertise level, your cross-project stack.  
**What does NOT belong here:** selectors, fixtures, import paths — those are project-specific (Exercise 1b).

#### Step 1 — Run the intake

Open `sdet-persona-intake.md` (in this repo). Tell Claude:

```
Use sdet-persona-intake.md to interview me and generate my ~/.claude/CLAUDE.md
```

Claude will ask questions section by section:
1. Who you are + how long in role
2. How you spend your time (people vs tooling vs hands-on)
3. Testing philosophy (RST, TDD, flaky test stance)
4. What you want from Claude (answer length, fix vs root cause, edge case flagging)
5. Your expertise — what Claude should skip explaining vs explain in depth
6. What wastes your time — what Claude should never do
7. Cross-project stack (languages, frameworks, CI, tools)

#### Step 2 — Review + approve

Claude shows the generated content before writing. Review it. Push back on anything wrong.

#### Step 3 — Claude writes `~/.claude/CLAUDE.md`

Example output from a real session:

```markdown
## Who I Am
- 10 years SDET. Lead QE team + framework/tooling work (~70-80% of time).
- RST practitioner (James Bach, Michael Bolton). Test pyramid is context-dependent.
- Goal: build skills and frameworks that work seamlessly for the team.

## How to Answer Me
- Shortest answer possible. I'll ask follow-ups.
- Failing test/error: give fix + root cause. Never just the fix.
- Proactively flag edge cases I didn't ask about.
- When unsure: give options, don't assume.

## Never Do This
- Don't run long tool sequences without first stating what you're about to do.
- Never assume I want a quick fix. I want root cause analysis first.
- Don't suggest manual testing as a solution.

## My Expertise
- Expert: testing strategy, automation, Playwright, SuperTest, TypeScript.
- Skip basics in these areas.
- Performance testing: treat me as non-expert, explain properly.

## Stack (cross-project)
- Languages: TypeScript
- Frameworks: Playwright, SuperTest
- CI: Jenkins
- Tools: Jira, Splunk
```

### Evidence — Before vs After global CLAUDE.md

**Prompt:** "This test is flaky. What do I do?"

**Before:** Claude suggests `page.waitForTimeout(1000)` or retry logic — assumes you want it passing fast.

**After:** Claude asks what the failure pattern is, investigates root cause first, flags whether the flakiness is in the app or the test — because it knows you follow RST and want root cause, not a quick fix.

### Exercise 1b — Project context (15 min)

Create `pw-framework/CLAUDE.md`:

```markdown
# pw-framework Project Context

## Framework structure
- `pages/`           — Page objects (one file per page)
- `fixtures/`        — Playwright test fixtures (index.ts exports all)
- `tests/`           — Test specs grouped by feature (cart/, checkout/, product/)
- `common_actions/`  — Cross-page flows (e.g. add to cart + navigate)
- `data/`            — Test data constants (PRODUCTS, USERS)

## Available fixtures
Import from `../../fixtures`:
- `homePage`       — HomePage instance
- `cartPage`       — CartPage instance  
- `checkoutPage`   — CheckoutPage instance
- `productPage`    — ProductPage instance
- `shopFacade`     — Cross-page flows (addToCartAndGoToCart, etc.)

## Page object pattern
See `pages/cart.page.ts` for reference. Pattern:
- Constructor receives `page: Page`
- All locators as `readonly` class properties
- Methods for multi-step interactions only
- No assertions inside page objects

## Environment
- Base URL: `process.env.BASE_URL` (default: https://practicesoftwaretesting.com)
- Auth: `tests/auth.setup.ts` handles login state
```

### Evidence — New joiner onboarding

**Prompt (same both times):**
> "I just joined the team. How do I write a test for the cart page?"

---

**Before `pw-framework/CLAUDE.md` exists:**

Claude explores the repo first — reads `playwright.config.ts`, scans `tests/`, `pages/`, `fixtures/`. Takes 4–6 tool calls. Then answers:

> "You can create a test file under `tests/`. Import `test` and `expect` from `@playwright/test`. Create a `CartPage` instance by passing the `page` object..."

Problems:
- Imports from `@playwright/test` directly (bypasses fixture system)
- Doesn't know `cartPage` fixture exists
- Doesn't reference `../../fixtures` import path
- May invent its own page object instead of using existing `cart.page.ts`
- No mention of `data/` constants or `common_actions/`

---

**After `pw-framework/CLAUDE.md` exists:**

Zero file exploration. Immediate answer:

> "Tests live in `tests/cart/`. Import fixtures from `../../fixtures` — `cartPage` and `shopFacade` are already set up for you. Follow the pattern in `pages/cart.page.ts`: readonly locators, no assertions inside the page object. Use `PRODUCTS` from `data/` for test data. Auth is handled by `tests/auth.setup.ts` — no login needed in your test."

Correct on first response. No exploration. No wrong imports.

---

**What to show live:** Delete `CLAUDE.md`, ask question, screenshot response. Recreate `CLAUDE.md`, ask same question, screenshot response. Side by side.

**Key takeaway:** CLAUDE.md = configuration for Claude's behaviour. Treat it like a team onboarding doc that never goes stale.

---

## Module 2 — Skills + MCP (60 min) `CORE`

### Concept (10 min)

Skills = reusable prompt templates. Live in `~/.claude/skills/` (global) or `.claude/skills/` (project). Invoked with `/skill-name`.

Think of skills as test utilities — but for prompts. Codify team standards once, everyone uses them.

**Demo:** Run `/explain-test` on `tests/cart/cart.spec.ts`. Note the output format.

---

### Exercise 2a — `/analyze-failure` skill (15 min)

Create `.claude/skills/analyze-failure/SKILL.md`:

```markdown
---
name: analyze-failure
description: >
  Analyzes a Playwright test failure from trace, screenshot, or error output.
  Use when user says "why did this test fail", "analyze failure", or invokes /analyze-failure.
---

Given: test name, error output, and/or trace path.

Produce exactly:

**Root cause:** [one sentence — what went wrong]  
**Failing line:** [file:line]  
**Selector/assertion:** [the exact locator or expect() that failed]  
**Fix:** [concrete code change — before/after if helpful]  

No preamble. No trailing explanation.
```

**Test it:** Find any failing test output in `test-results/` and run `/analyze-failure`.

---

### MCP Interlude — Why we need it for page objects (5 min)

To generate a reliable page object, Claude needs to see the actual DOM — selectors, roles, `data-test` attributes. Without MCP, Claude guesses from code. With MCP, Claude reads the live page.

**Playwright MCP** gives Claude:
- `browser_navigate` — go to URL
- `browser_snapshot` — read live DOM / accessibility tree
- `browser_take_screenshot` — capture visual state
- `browser_click`, `browser_fill_form`, `browser_type` — interact with page

Config in `pw-framework/.mcp.json`. Verify:
```bash
claude mcp list
# Should show: playwright
```

---

### Exercise 2b — `/gen-page-object` skill with live MCP (20 min)

Create `.claude/skills/gen-page-object/SKILL.md`:

```markdown
---
name: gen-page-object
description: >
  Generates a Playwright page object from a URL using live browser snapshot via Playwright MCP.
  Use when user says "generate page object", "create page object for", or invokes /gen-page-object.
---

Steps:
1. Use Playwright MCP to navigate to the given URL
2. Take a browser snapshot to read the live DOM
3. Identify all interactive elements and key data elements
4. Generate a TypeScript page object following the pattern in `pages/cart.page.ts`

Rules:
- Class name: `[PageName]Page`
- Constructor: `constructor(page: Page)`
- All locators: `readonly` class properties
- Selector priority: `data-test` attr > ARIA role > text > CSS
- Export the class as named export
- No assertions inside the page object
- Methods only for multi-step interactions

Output: TypeScript class only. No test code.
```

**Run it:**
```
/gen-page-object
URL: https://practicesoftwaretesting.com/#/products
```

Compare result to `pages/home.page.ts`. What did Claude find that you would have missed?

---

### Exercise 2c — `/write-test` skill (10 min)

Create `.claude/skills/write-test/SKILL.md`:

```markdown
---
name: write-test
description: >
  Writes a Playwright test from acceptance criteria. Use when user says
  "write a test for", "generate test", or invokes /write-test.
---

Given: acceptance criteria or feature description.

Write a test using `pw-framework` conventions:
- Import from `../../fixtures` (not from `@playwright/test` directly)
- Use available fixtures: homePage, cartPage, checkoutPage, productPage, shopFacade
- Use data constants from `../../data/PRODUCTS` where applicable
- Follow test naming: `should [outcome] when [condition]`
- One `expect` per test where possible
- No `page.waitForTimeout()`

Output: test file content only. No explanation.
```

**Key takeaway:** Skills encode team standards as reusable prompts. MCP makes those skills accurate — Claude reads live UI, not guesses.

---

## Module 3 — Subagents (45 min) `CORE`

### Concept (10 min)

Agents = specialized Claude instances defined in `.claude/agents/` markdown files.

**Why agents instead of asking Claude inline?**
- **Specialization** — focused instructions, tuned model
- **Context protection** — agent reads large files (traces, logs) without polluting main context
- **Parallelism** — multiple agents run simultaneously on independent tasks

**Demo:** Walk through `page-object-finder.md`. Point out: frontmatter (name, description, model, tools), when it triggers, what it does.

---

### Exercise 2a — Study existing agent (10 min)

Read `pw-framework/.claude/agents/page-object-finder.md`. Answer:
1. What model does it use?
2. What tools does it have access to?
3. When does it auto-trigger?
4. What makes its system prompt reliable?

---

### Exercise 2b — `failure-analyzer` agent (20 min)

Create `pw-framework/.claude/agents/failure-analyzer.md`:

```markdown
---
name: failure-analyzer
description: >
  Analyzes Playwright test failures from trace archives, screenshots, and JSON test output.
  Use when a test fails and you need root cause analysis. Accepts: trace zip path,
  test-results/ directory, or raw error output.
model: claude-opus-4-7
tools: Read, Bash, Grep
---

You are a Playwright failure forensics specialist. Given a test failure, produce a structured diagnosis.

## Input sources (check in this order)
1. `test-results/` directory — screenshots, videos, trace zips
2. `playwright-report/` — HTML report JSON
3. Raw error output from user

## For trace files
```bash
unzip -o <trace.zip> -d trace-extracted
# Then read trace-extracted/trace.json for network/action timeline
```

## Output format (always)

**Test:** [test name]  
**Root cause:** [one sentence]  
**Failing step:** [what action or assertion failed]  
**Evidence:** [screenshot path or trace event that confirms it]  
**Fix:** [specific code change]  

No preamble. No "I found that...". Start with **Test:**.
```

---

### Exercise 2c — `selector-finder` agent (15 min)

Create `pw-framework/.claude/agents/selector-finder.md`:

```markdown
---
name: selector-finder
description: >
  Finds all usages of a given selector, locator string, or data-test attribute
  across page objects and test files. Use when refactoring selectors or debugging
  why a locator breaks across multiple tests.
model: claude-haiku-4-5-20251001
tools: Grep, Read
---

Find every usage of the given selector string in the codebase.

Search in:
- `pages/` — page object definitions
- `tests/` — test specs
- `common_actions/` — shared flows

Output: file:line table only.

| File | Line | Context |
|------|------|---------|
| pages/cart.page.ts | 18 | `this.proceedToCheckoutButton = page.locator('[data-test="proceed-1"]')` |

No analysis. No suggestions. Table only.
```

**Key insight:** `selector-finder` uses Haiku (cheap, fast, read-only). `failure-analyzer` uses Opus (complex reasoning on trace data). Match model to task.

---

## Module 4 — Hooks + settings.json (45 min) `CORE`

### Concept (10 min)

`settings.json` controls:
- **Permissions** — which tools Claude can run without prompting
- **Environment variables** — injected into Claude's shell
- **Hooks** — shell commands triggered on Claude Code events

Key hook events:
| Event | Fires when |
|-------|-----------|
| `PreToolUse` | Before Claude calls a tool |
| `PostToolUse` | After tool completes |
| `Stop` | Claude finishes a response |

**Demo:** Show `settings.local.json` in this project — point out Playwright MCP permissions and why they're there.

---

### Exercise 3a — TypeScript compile hook (15 min)

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "cd /path/to/pw-framework && npx tsc --noEmit 2>&1 | head -30"
          }
        ]
      }
    ]
  }
}
```

Every time Claude writes or edits a TypeScript file, the compiler runs. Errors feed back into context — Claude self-corrects.

**Test it:** Ask Claude to write a test with a deliberate type error. Watch the loop.

---

### Exercise 3b — Auto-run test hook (20 min)

Extend the hook to run the test file after it's written:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'FILE=\"$CLAUDE_TOOL_INPUT_FILE_PATH\"; if [[ \"$FILE\" == *\".spec.ts\" ]]; then cd /path/to/pw-framework && npx playwright test \"$FILE\" --reporter=line 2>&1 | tail -20; fi'"
          }
        ]
      }
    ]
  }
}
```

When Claude writes a `.spec.ts` file, Playwright runs it immediately. Pass/fail feeds back — Claude fixes failures without prompting.

**Key insight:** write → run → fix loop runs automatically. Claude doesn't need to be told to check its work.

---

## Module 5 — Capstone (60 min) `CORE`

### Scenario

You're on-call. CI failed. Test: `Checkout > should complete order with valid payment`.  
You have: a trace zip, a screenshot, and the test output log.

### Task

**Step 1 — Run failure-analyzer agent**
```
Use the failure-analyzer agent on test-results/ to diagnose the checkout payment failure.
```

**Step 2 — Reproduce visually with MCP**
```
Use Playwright MCP to navigate to the checkout payment step.
Screenshot the current state. Does it match what the trace shows?
```

**Step 3 — Use /analyze-failure skill**
```
/analyze-failure
Test: Checkout > should complete order with valid payment
Error: [paste error output]
Trace: test-results/checkout-payment/trace.zip
```

**Step 4 — Fix the test**
Ask Claude to write the fix. The `tsc` hook and test-run hook validate automatically.

**Step 5 — Commit**
```
/caveman-commit
```

### Success criteria

- [ ] Test passes locally (hook confirmed green)
- [ ] Fix uses no `waitForTimeout`
- [ ] Fix uses `data-test` selectors where available
- [ ] Commit message explains why, not what

---

## Optional Modules

Run these after core if time allows. Any order.

---

### Optional A — Model Selection (30 min)

| Model | ID | Best for | Cost |
|-------|----|----------|------|
| Haiku 4.5 | `claude-haiku-4-5-20251001` | Simple gen, lookups, renames | Cheapest |
| Sonnet 4.6 | `claude-sonnet-4-6` | Test writing, moderate analysis | Mid |
| Opus 4.7 | `claude-opus-4-7` | Complex failure analysis, architecture | Highest |

Set model via CLI `--model`, `/model` command, or agent frontmatter.

#### Exercise B1 — Compare models on same task (10 min)

Run with Haiku, then Opus:
> "C07 in cart.spec.ts uses `page.waitForTimeout(500)`. Why is this bad? How do I fix it?"

Compare: reasoning depth, fix quality, response length.

#### Exercise B2 — Review agent model choices (10 min)

- `failure-analyzer` → Opus. Why?
- `selector-finder` → Haiku. Why?
- `page-object-finder` → Sonnet. Justify.

**Rule:** Agents reasoning over complex artifacts → Opus. Agents searching/returning structured data → Haiku.

---

### Optional B — Memory (30 min)

**Concept:** Memory = persistent facts that survive session resets. Lives in `~/.claude/projects/<encoded-path>/memory/`. `MEMORY.md` = index file, always loaded.

Memory types:
| Type | Use for |
|------|---------|
| `feedback` | Team rules, what Claude should/shouldn't do |
| `project` | Known bugs, flaky tests, environment quirks |
| `user` | Your role, experience level |
| `reference` | Where to find things (dashboards, docs, repos) |

#### Exercise C1 — Save flaky test knowledge (10 min)

Create `~/.claude/projects/<path>/memory/flaky-cart-total.md`:

```markdown
---
name: flaky-cart-total
description: C07 cart total test uses waitForTimeout — known flaky in CI
metadata:
  type: project
---

C07 `cart total updates after quantity change` uses `page.waitForTimeout(500)` — flaky in CI under load.

**Why:** Network latency on total recalculation varies.  
**Fix:** Replace waitForTimeout with `await expect(cartPage.cartTotal).not.toHaveText(before, { timeout: 3000 })` before asserting new value.
```

#### Exercise C2 — Save team feedback memory (10 min)

```markdown
---
name: feedback-no-timeout
description: Never use page.waitForTimeout — team rule
metadata:
  type: feedback
---

Never use `page.waitForTimeout()` in tests.

**Why:** Team had false-passing tests in CI for 2 sprints — arbitrary waits hid intermittent network issues. Bug reached prod.  
**How to apply:** Use explicit locator waits with `{ timeout }` option instead.
```

**Key insight:** Memory = institutional knowledge. Survives session resets. New team member onboards by installing Claude Code, not reading Confluence.

---

### Optional C — Plugins (45 min)

**Concept:** Plugins package skills + agents into a single installable unit.

```
playwright-sdet-plugin/
  plugin.json
  skills/
    analyze-failure.md
    gen-page-object.md
    write-test.md
  agents/
    failure-analyzer.md
    selector-finder.md
```

#### Exercise D1 — Create manifest (10 min)

```json
{
  "name": "playwright-sdet",
  "version": "1.0.0",
  "description": "SDET skills and agents for Playwright TypeScript teams",
  "author": "your-team",
  "skills": [
    "skills/analyze-failure.md",
    "skills/gen-page-object.md",
    "skills/write-test.md"
  ],
  "agents": [
    "agents/failure-analyzer.md",
    "agents/selector-finder.md"
  ]
}
```

#### Exercise D2 — Package + swap (20 min)

Move skill/agent files from Modules 1–2 into plugin dir. Swap with a teammate:

```bash
claude plugin install ./their-plugin-dir
```

Verify `/analyze-failure` and `/gen-page-object` work.

```bash
# Publish to registry
claude plugin publish

# Install from registry
claude plugin install playwright-sdet
```

---

## Reference

### Critical files

| Path | Purpose |
|------|---------|
| `playwright.config.ts` | Test runner config, base URL, reporters |
| `fixtures/index.ts` | All custom fixtures exported here |
| `pages/cart.page.ts` | Reference page object — follow this pattern |
| `.claude/agents/page-object-finder.md` | Reference agent to study |
| `.claude/settings.local.json` | Permissions + hooks config |
| `tests/cart/cart.spec.ts` | Style reference test file |

### Quick-reference commands

| Command | Does |
|---------|------|
| `/explain-test` | One-line summary per test |
| `/analyze-failure` | Root cause from trace/error |
| `/gen-page-object` | Page object from live URL via MCP |
| `/write-test` | Test from acceptance criteria |
| `/model` | Switch model for session |

### Instructor checklist

- [ ] Pre-broken test + trace + screenshot ready for Capstone
- [ ] All participants: Claude Code Pro or API key
- [ ] Playwright MCP installed: `claude mcp add playwright`
- [ ] practicesoftwaretesting.com accessible — check before workshop
- [ ] Room has reliable WiFi (MCP exercises hit live site)
- [ ] Plugin template dir ready if running Optional D
