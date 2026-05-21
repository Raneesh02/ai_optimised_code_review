# Project CLAUDE.md Intake — Project Context Builder

Answer these questions. Claude explores the repo for structure — this file captures only preferences and rules that code can't tell.

**For Claude:** When running this intake, use the `AskUserQuestion` tool — present each section as interactive multiple choice, max 4 questions per call. Do not dump questions as plain text.

Skip anything that doesn't apply.

---

## 1. Project Identity

**1.1** What is this project?

```
Your answer:
```

**1.2** Target site / app under test?

```
Your answer:
```

---

## 2. Test Conventions

**2.1** Selector priority:

```
[ ] data-test > id > ARIA role — no CSS or xpath
[ ] ARIA role first (accessibility-first)
[ ] Whatever's already in the codebase
[ ] Other:
```

**2.2** Assertions inside page objects?

```
[ ] No — pure interaction only
[ ] Yes — assertion helpers allowed
[ ] Mixed — soft assertions OK, hard not
```

**2.3** Test naming pattern:

```
[ ] ID prefix style: C01 add product appears in cart
[ ] should [outcome] when [condition]
[ ] [feature] — [scenario]
[ ] Follow existing tests
```

**2.4** Banned patterns (select all that apply):

```
[ ] page.waitForTimeout() — use explicit locator waits
[ ] Raw page in tests — always use fixtures
[ ] CSS/xpath selectors
[ ] Hardcoded strings — use constants
[ ] Assertions inside page objects
```

**2.5** Assertion style:

```
[ ] One expect per test — strict
[ ] Multiple expects OK for one logical behaviour
[ ] Soft assertions (expect.soft)
[ ] Follow existing code
```

**2.6** Test tags:

```
[ ] @regression on every test always
[ ] @smoke for critical path, @regression for full suite
[ ] No tags — filter by folder
[ ] Not yet, suggest defaults
```

---

## 3. Coding Guidelines

**3.0** Where should coding standards live?

```
[ ] Inside CLAUDE.md — all-in-one, simpler setup
[ ] Separate file at .claude/code_guidelines.md (recommended — keeps CLAUDE.md lean, skills @-include on demand)
[ ] Custom path — I'll specify:
```

Custom path (if chosen):

```
Your answer:
```

> **Note:** If separate file chosen, CLAUDE.md gets a brief summary only. Skills that need full detail `@`-include the standards file directly — avoids loading full standards into every conversation.

**3.1** AAA pattern:

```
[ ] Strict — one assert, clear Arrange/Act/Assert sections
[ ] AAA but multiple asserts OK for one behaviour
[ ] Loose — no formal structure required
```

**3.2** beforeEach vs self-contained:

```
[ ] beforeEach handles shared Arrange
[ ] Each test fully self-contained
[ ] Mixed — beforeEach for nav/auth, test owns its data
```

**3.3** DRY vs explicit:

```
[ ] DRY — extract helpers aggressively
[ ] Explicit — repeat setup, easier to read in isolation
[ ] Balanced — extract only at 3+ usages (rule of three)
```

**3.4** Assertion error messages:

```
[ ] Always: expect(x, 'should show 1 item').toHaveCount(1)
[ ] Never — locator name is enough context
[ ] Only on non-obvious assertions
```

---

## 4. Flaky Test Policy

**4.1** When a test goes flaky:

```
[ ] Fix root cause immediately — block merge until green
[ ] test.fixme() + ticket — unblock team first
[ ] Quarantine to separate suite, investigate async
[ ] Delete — untrusted test is noise
```

**4.2** Should Claude flag suspected flaky patterns it writes?

```
[ ] Yes — add comment explaining the risk
[ ] Yes — add @flaky tag + comment
[ ] No — flag in chat only, don't touch the test
```

---

## 5. Traceability & Gotchas

**5.1** Test IDs (C01, C02...) linked to external tool?

```
[ ] No — local naming convention only
[ ] Yes — maps to TestRail / Jira (specify tool below)
```

Tool name (if yes):

```
Your answer:
```

**5.2** Claude generating new tests — ID behaviour:

```
[ ] Generate next sequential ID automatically
[ ] Leave ID for me to assign
[ ] No IDs needed
```

**5.3** Project-specific rules Claude must never break:

```
Your answer:
```

---

## Generate CLAUDE.md

Once filled in, run:

```
Use my answers in Exer1b_claudemd_project_intake.md to generate a CLAUDE.md for this project.
```
