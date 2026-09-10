---
name: changelog-commit-messages
description: 'Use when preparing commit messages or deciding how to commit changes.'
argument-hint: '[describe the change or paste a draft commit message]'
---

# Changelog Commit Messages

Use this skill when writing or reviewing commit messages for this repository.

The changelog config in `.github/changelog_config.json` extracts the commit type from the first line and publishes the commit body as the release-note entry. That means the title and body serve different audiences:

- The first line is for developers.
- The body is for end users reading release notes.

## Commit Message Scale

Choose the highest level that accurately matches the visible impact.

### 1. `chore:`

Use `chore:` when the change does not have a clear user-visible impact.

Common examples:

- Tests only
- Deployment or CI changes
- Refactors with no user-facing behavior change
- Dependency updates
- Internal cleanup
- Build tooling or configuration changes

Guidance:

- Prefer `chore:` over forcing a weak `feat:` or `fix:` label.
- If there is no user-facing outcome worth publishing, omit the body or keep it purely internal.
- Do not try to turn technical maintenance into release-note copy.

### 2. `fix:`

Use `fix:` when the change corrects a user-visible problem.

Examples:

- A page now loads correctly
- A broken action now works
- Incorrect status, counts, or labels now display correctly
- Navigation or form behavior now behaves as expected

Guidance:

- The title should summarize the repair for developers.
- The body should describe the user-visible improvement only.

### 3. `feat:`

Use `feat:` when the change adds a user-visible capability or noticeable enhancement.

Examples:

- A new view, action, or workflow
- A new option or control users can interact with
- A meaningful improvement that users will notice without reading implementation details

Guidance:

- The title should name the added capability for developers.
- The body should explain the user benefit in plain language.

## Required Structure

Write commits in this format:

```text
<type>: <developer-oriented summary>

<user-facing changelog message>
```

Rules:

- Use `feat`, `fix`, or `chore` as the type.
- Keep the first line technical enough for developers to scan history quickly.
- Treat the body as release-note text that can be published as written.
- If the change is a `chore:` with no user-facing effect, the body should usually be omitted.

## Body Rules

The body is release-note copy. Write it for users, not maintainers.

The body must:

- Focus on what changed from the user perspective
- Use plain language
- Be brief and direct
- Stand on its own outside engineering context

The body must not mention:

- Tests
- Deployment
- CI
- Refactoring
- File names
- Components, stores, APIs, or database details
- Libraries, packages, or dependencies
- Implementation strategy
- Internal maintenance work

## Decision Process

1. Ask whether a user would notice the change without reading code or release notes.
2. If no, use `chore:`.
3. If yes and it fixes something broken or incorrect, use `fix:`.
4. If yes and it adds or expands capability, use `feat:`.
5. If the repo contains mixed changes that belong to different types or different user-facing stories, split them into multiple commits.
6. Keep unrelated chores separate from user-facing `feat:` or `fix:` commits whenever possible.
7. Write the first line for developers.
8. Write the body as release-note text for users.
9. Remove any technical detail from the body.
10. If the body still reads like engineering work, either rewrite it in user language or downgrade the commit to `chore:`.

## Version Bumps

If the user asks for bumping, using `bump`, or calling `bump` as part of the process:

- Run `bump.sh` from the repository root.
- Use no arguments by default.
- If the user explicitly asks for `major` or `minor`, pass that argument to `bump.sh`.
- Do not invent other bump arguments unless the user specifies them.

## Quality Checks

Before finalizing a commit message, verify:

- The first line starts with `feat:`, `fix:`, or `chore:`.
- The first line is useful to developers scanning git history.
- Mixed changes have been split into separate commits when needed.
- The body says what users gain, notice, or no longer experience.
- The body does not mention tests, deployment, refactors, or other technical details.
- A weak or invisible user impact has not been mislabeled as `feat:` or `fix:`.

## Examples

### Good `feat:`

```text
feat: add filtering to certification records

Users can now filter certification records by term to find the right request faster.
```

### Good `fix:`

```text
fix: correct unread comment count in record list

Unread comment counts now match the latest activity shown on each record.
```

### Good `chore:`

```text
chore: update Playwright coverage for certification flows
```

### Bad published body

```text
fix: patch record loading edge case

Adds test coverage, updates the store watcher, and adjusts the API call during deployment.
```

Why it is bad:

- It describes implementation instead of user impact.
- It mentions tests and deployment.
- It should either be rewritten in user language or classified as `chore:` if no user-facing change exists.

## What To Produce

When asked to write a commit message, return:

1. A recommended commit message in final form.
2. Recommend multiple commits when the repo contains mixed changes that should not share one type or one user-facing message.
3. The chosen type with a one-sentence rationale if the classification is not obvious.
4. A short warning when the draft looks like `chore:` work disguised as `feat:` or `fix:`.