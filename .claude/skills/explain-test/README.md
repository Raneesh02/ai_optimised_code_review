# explain-test

Caveman-compressed test explanations. What's tested, setup, scenarios, assertions, failure conditions.

## What it does

Reads test code (file path, test name, or pasted snippet) and outputs a terse block per test function:
- **Tests:** system under test
- **Setup:** mocks, fixtures, state
- **Cases:** each scenario in plain English
- **Asserts:** what each check verifies
- **Breaks when:** conditions that fail the test

Optional tags: `⚠️ tricky`, `🔗 depends`, `🐛 smell` for non-obvious test structure.

## How to invoke

```
/explain-test
```

Also triggers on "explain this test", "what does this test do", "explain test".

Provide file path, file path + test name, or paste the snippet directly.

## Example output

```
**returns 404 when user not found**
Tests: GET /users/:id — missing user branch
Setup: `mockDb.findUser` returns null
Cases: request user id 999, no record exists
Asserts: status 404, body.error = "User not found"
Breaks when: handler returns 500 instead of 404, or error message differs
```

## See also

- [`SKILL.md`](./SKILL.md) — full LLM-facing instructions
