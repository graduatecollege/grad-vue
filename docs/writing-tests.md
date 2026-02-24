# Writing Tests

- Use the `mnt` function from test-utils rather than `mount`.
- Use vitest-browser's more semantic locators rather than CSS selectors.
- Create fixtures when more than one test uses the same setup.
- Avoid repeating a lot of code in each test, write helper functions instead.
