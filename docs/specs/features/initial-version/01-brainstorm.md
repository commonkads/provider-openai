# Brainstorm — initial-version

The strata monorepo hosted provider packages under the `@robproper` scope as workspace packages. Migrating each provider to a standalone repository under `@commonkads` gives:

- **Independent release cycles** — each provider can be versioned and published without touching the others.
- **Cleaner npm publishing** — packages publish to GitHub Packages under the `@commonkads` org with no monorepo tooling required.
- **Reduced coupling** — consumers install only the providers they need; no monorepo lockfile or workspace resolution required.

Key questions settled:

| Question | Decision |
|----------|----------|
| Migrate all providers at once or one at a time? | All at once — consistent state across the ecosystem. |
| Change provider logic during migration? | No — source is ported verbatim; only imports and package name are updated. |
| Keep the same public API surface? | Yes — class names, options types, and register functions are unchanged. |
