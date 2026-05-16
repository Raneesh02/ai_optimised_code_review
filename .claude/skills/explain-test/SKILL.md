---
name: explain-test
description: >
  Explains what a test asserts in one line per test. Use when user says
  "explain this test", "what does this test do", "explain test", or invokes /explain-test.
---

Read test. One line per test fn: what it asserts.

## Format

```
[test name]: [what it asserts]
```

## Example

Input:
```js
it('returns 404 when user not found', async () => {
  mockDb.findUser.mockResolvedValue(null);
  const res = await request(app).get('/users/999');
  expect(res.status).toBe(404);
  expect(res.body.error).toBe('User not found');
});
```

Output:
```
returns 404 when user not found: status 404 + error message when user missing from DB
```