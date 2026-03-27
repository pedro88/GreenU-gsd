# Git Flow

## Branch Model

```
main          — production-ready, tagged releases
develop       — integration branch for the next release
milestone/*   — worktrees per milestone (managed by GSD)
feature/*     — new features branched from develop
fix/*        — bug fixes branched from develop (or main for hotfixes)
```

## Conventions

### Branch naming

| Type | Format | Example |
|------|--------|---------|
| Milestone | `milestone/M001` | `milestone/M001-eh88as` |
| Feature | `feature/<short-description>` | `feature/oauth-login` |
| Bug fix | `fix/<short-description>` | `fix/calendar-timezone` |
| Hotfix | `hotfix/<description>` | `hotfix/auth-session-fix` |

### Workflow

1. **Feature/fix work**: branch from `develop`, PR back to `develop` when ready
2. **Milestone work**: GSD manages worktrees on `milestone/<MID>` branches, squash-merged to `develop` on milestone completion
3. **Releases**: when `develop` is stable, merge to `main` and tag with version (`v1.0.0`, `v1.1.0`, etc.)
4. **Hotfixes**: branch from `main`, PR to both `main` and `develop`

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add OAuth login support
fix: correct frost date calculation for zone 7
refactor: extract garden permission helpers
docs: update planting calendar docs
test: add E2E tests for calendar view
```

Prefix scope when relevant: `feat(calendar): add task list view`

### PR requirements

- Must pass ESLint (no warnings)
- Must pass type check (`tsc --noEmit`)
- Must have a meaningful description
- Must be reviewed before merge (for shared features)

## Current State

- `main`: v1.0.0 — MVP + M002 (Social) + M003 (Pro) ✅
- `develop`: synced with `main` (fresh branch)
