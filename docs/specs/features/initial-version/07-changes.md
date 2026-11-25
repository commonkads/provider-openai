# Changes — initial-version

## New files

| File | Description |
|------|-------------|
| `package.json` | Package manifest — `@commonkads/provider-openai` |
| `src/openai.ts` | `OpenAITextInference` — `IInferenceProvider` backed by any OpenAI-compatible API |
| `src/openai.test.ts` | Unit tests for `OpenAITextInference` |
| `src/index.ts` | Public exports and `registerOpenAIProviders()` |
| `tsconfig.json` | TypeScript build config |
| `tsconfig.test.json` | TypeScript config for type-checking tests |
| `eslint.config.mjs` | ESLint config (typescript-eslint + prettier) |
| `.github/workflows/ci.yml` | CI workflow (lint, compile, test, pack) |
| `.github/workflows/release.yml` | Release workflow (changesets publish) |
| `.changeset/config.json` | Changesets configuration |
| `.npmrc` | Registry routing for `@commonkads` |
| `README.md` | Usage documentation |
| `CHANGELOG.md` | Initial changelog entry |

## Modified files

None — brand new repository.

## Deviations from design

None.
