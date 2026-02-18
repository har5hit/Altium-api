# API SDK Generator

Language-agnostic SDK generation support module for this project.

This generator reads backend source code (`routes` + `usecases` + models), not Swagger/OpenAPI specs.

## Generate Swift SDK

`npm run sdk:generate -- --lang swift --source-root src --out api-sdk/generated/swift`

Generated output:
- `Apis/` per-feature API files
- `Models/` all generated models in one common models directory

## Extending for other languages

Add a new generator module and register it in:
`api-sdk/src/generate-sdk.mjs`
