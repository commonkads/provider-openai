## 2026-11-25

- Decision: extracted from strata monorepo as a standalone @commonkads package; source unchanged, only imports and package name updated
- Decision: @commonkads/engine ^0.1.0 used as the dependency version matching the engine package's current published version
- Decision: CI workflow triggers on pull_request to main and workflow_dispatch; release workflow triggers on push to main and workflow_dispatch
- Decision: no package-lock.json committed; will be generated on first npm install with valid NPM_READ_TOKEN
