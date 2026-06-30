# Git — commit convention

Tooling to enforce the **Conventional Commits** format across the team.

## Install (once after cloning)

```bash
bash .resources/git/set_linter.sh
```

This script configures, **locally to this repo**:
- `commit.template` → shows the template when running `git commit` (without `-m`)
- `core.hooksPath` → enables the hooks in `src/hooks`

## Contents

| File | Role |
|------|------|
| `set_linter.sh` | Sets up template + hooks. Each member runs it. |
| `src/commit_template` | Message template shown in the commit editor. |
| `src/hooks/commit-msg` | Hook that **validates** the message before accepting it. |

## Enforced format

```
<type>(<scope>): <description>
```

Example: `feat(back): add login via 42 oauth`

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change without new feature or fix |
| `style` | Formatting, indentation (no logic impact) |
| `docs` | Documentation |
| `test` | Adding/updating tests |
| `chore` | Config, dependencies, misc tasks |
| `perf` | Performance improvement |

### Scopes

| Scope | Area |
|-------|------|
| `front` | Frontend |
| `back` | Backend |
| `infra` | Infrastructure / deployment |
| `repo` | Repo-wide config & tooling |

## Adding a scope

Scopes are defined in two places — update **both** to keep them in sync:

1. `src/hooks/commit-msg` → add it to the `scopes` variable:
   ```bash
   scopes='front|back|infra|repo|newscope'
   ```
2. `src/commit_template` → add it to the `# Scopes:` help line.
3. This `README.md` → add a row to the [Scopes](#scopes) table.

The change takes effect immediately (no need to re-run `set_linter.sh`).

## Rules checked by the hook

The commit is **rejected** if:
1. the header doesn't match the `type(scope): description` pattern;
2. the first line exceeds 50 characters;
3. it ends with a `.`.

Lines starting with `#`, empty lines, and git prefixes (`Merge`, `Revert`, `fixup!`, `squash!`) are ignored.


