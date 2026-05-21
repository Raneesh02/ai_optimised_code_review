# SDET Persona Intake — Global CLAUDE.md Builder

Answer these questions. Claude uses your answers to generate a `~/.claude/CLAUDE.md` that makes it work efficiently for you across all projects.

**For Claude:** When running this intake, use the `AskUserQuestion` tool — present each section as interactive multiple choice, max 4 questions per call. Do not dump questions as plain text.

Skip any question that doesn't apply. One-line answers are fine.

---

## 1. Who You Are

**1.1** How long have you been an SDET (or in a testing-focused engineering role)?

```
Your answer:
```

**1.2** What was your background before SDET? (e.g. manual QA, software dev, both, something else)

```
Your answer:
```

**1.3** Describe your current role in one sentence. What does your team expect from you?

```
Your answer:
```

---

## 2. How You Spend Your Time

**2.1** Rank these by how much time you actually spend on them (1 = most):

```
[ ] Writing/maintaining automated tests
[ ] Triaging and debugging CI failures
[ ] Reviewing PRs for testability/quality
[ ] Designing test strategy
[ ] Investigating flaky tests
[ ] Talking to devs about edge cases / requirements
[ ] Tooling and framework maintenance
[ ] Reporting / stakeholder communication
```

**2.2** What's your biggest recurring pain point at work?

```
Your answer:
```

---

## 3. Testing Philosophy

**3.1** Where do you stand on the test pyramid? Pick one:

```
[ ] Heavy unit tests — integration/e2e only for critical paths
[ ] Balanced — meaningful coverage at all levels
[ ] Heavy e2e — test what users actually do
[ ] It depends on the system — I choose per context
```

**3.2** How do you decide what's worth automating?

```
Your answer:
```

**3.3** Flaky test in CI. What's your instinct?

```
[ ] Fix root cause immediately, block merge until green
[ ] Skip + file ticket, unblock the team first
[ ] Quarantine to a separate suite, investigate async
[ ] Delete it — if it can't be trusted, it's noise
```

**3.4** Do you practice TDD?

```
[ ] Yes — tests before code always
[ ] Sometimes — depends on the type of work
[ ] No — I test after implementation
```

---

## 4. What You Want From Claude

**4.1** When you ask Claude a question, what's your default preference?

```
[ ] Shortest possible answer — I'll ask follow-ups if needed
[ ] Answer + key context — don't make me ask obvious follow-ups
[ ] Full explanation — I want to understand the why
```

**4.2** When Claude gives you code, what should come first?

```
[ ] Code immediately, explanation after (or on request)
[ ] Brief explanation, then code
[ ] It depends on the complexity
```

**4.3** Should Claude proactively flag edge cases and risks you didn't ask about?

```
[ ] Yes — always surface what I might have missed
[ ] Only if it's a significant risk
[ ] No — answer what I asked, I'll drive the conversation
```

**4.4** When you paste a failing test or error, what do you want back?

```
[ ] Just the fix
[ ] Fix + one-line explanation of root cause
[ ] Fix + explanation + what to watch for next time
```

**4.5** When Claude is unsure, should it:

```
[ ] Make a reasonable assumption and tell me what it assumed
[ ] Ask me before proceeding
[ ] Give me options and let me choose
```

---

## 5. Your Expertise — What Claude Should and Shouldn't Explain

**5.1** Topics where you're expert-level (Claude should skip basics, not over-explain):

```
Your answer: (e.g. Playwright, CI/CD pipelines, API testing, Git)
```

**5.2** Topics where you're still learning or less confident (Claude should explain more):

```
Your answer: (e.g. performance testing, security testing, database testing)
```

**5.3** Are there domains adjacent to your work where you want Claude to assume you're a non-expert?

```
Your answer: (e.g. backend architecture, mobile, ML systems)
```

---

## 6. What Wastes Your Time

**6.1** What does Claude currently do that's unhelpful or annoying?

```
Your answer: (e.g. too verbose, explains things I already know, misses the actual problem)
```

**6.2** What assumptions does Claude make that are wrong for your role?

```
Your answer: (e.g. assumes I want to fix bugs instead of test for them, suggests manual testing)
```

**6.3** Anything Claude should never do when working with you?

```
Your answer:
```

---

## 7. Cross-Project Stack Context

**7.1** Languages you work in regularly (not project-specific):

```
Your answer: (e.g. TypeScript, Python, Java)
```

**7.2** Test frameworks you use across projects:

```
Your answer: (e.g. Playwright, Cypress, pytest, JUnit)
```

**7.3** CI/CD system:

```
Your answer: (e.g. GitHub Actions, Jenkins, CircleCI)
```

**7.4** Any tools/platforms that appear across your projects Claude should know about:

```
Your answer: (e.g. Jira, TestRail, Datadog, PagerDuty)
```

---

## Generate Your CLAUDE.md

Once you've filled this in, run:

```
Use my answers in sdet-persona-intake.md to generate a ~/.claude/CLAUDE.md that tells Claude who I am and how to work with me effectively.
```

Claude will produce a global CLAUDE.md tailored to your answers.
