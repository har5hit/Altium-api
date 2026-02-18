# AI.md

This file provides guidance to AI Code when working with code in this repository.

## Project Overview

Altium-api is a Fastify-based REST API backend for the Altium iOS app. TypeScript with ESM (`"type": "module"`), PostgreSQL, and Redis.

## Commands

```bash
npm run dev          # run with tsx watch (auto-reload)
npm run build        # compile TypeScript to dist/
npm start            # run compiled output (node dist/app/server.js)
npm test             # run tests (tsx --test tests/**/*.test.ts)
npx tsc --noEmit     # type-check without emitting
```

## Architecture

Layered architecture with strict separation: Routes -> Controllers -> Usecases -> Repositories -> DB.

- `src/app/server.ts` — entry point, calls `buildApp()` and listens
- `src/app/app.ts` — `buildApp()` assembles the Fastify instance: env, security plugins, app plugins, routes, error handler
- `src/app/di.ts` — dependency injection container; repositories are singletons and usecases are created per request
- `src/app/config/` — app-level config (`env.ts`, `constants.ts`)
- `src/app/plugins/` — Fastify plugins (db, redis, auth, swagger, ingest). Registered via `plugins/index.ts` which skips db/redis if their env vars are empty
- `src/app/routes/index.ts` — top-level route registration for all features
- `src/app/` — shared app code (`types.ts`, `errors.ts`, `logger.ts`, `helpers.ts`, `schemas/`)
- `src/support/` — non-app-specific support utilities shared across features/app
- `src/features/<feature>/` — feature layer with `routes/`, `controllers/`, `usecases/`, `repositories/` (+ `models/`, and optionally `providers/` + `workers/` for ingestion)
- `src/features/<feature>/repositories/*DbModel.ts` — repository db models/interfaces. Every db model file must end with `DbModel.ts`
- `src/middlewares/` — reusable Fastify hooks
- `src/migrations/` — PostgreSQL schema migrations
- `api-sdk/` — OpenAPI-based SDK generation support (Swift generator included)

## TypeScript

- Strict mode enabled, target ES2022, module Node16
- Use absolute alias imports from `@/` for local modules and keep `.js` extensions for ESM compatibility
- `tsx` is used for dev and tests (no build step needed during development)
- `tsc` compiles to `dist/` for production

## Security

APIs are open by default. Security is provided via:
- `@fastify/helmet` (HTTP headers)
- `@fastify/cors`
- `@fastify/rate-limit` (100 req/min default, configurable in `src/app/config/constants.ts`)
- Optional API key check: set `API_KEY` env var to enable `x-api-key` header validation (`src/app/plugins/auth.ts`)

## Football Data

- Football APIs are read-only (GET routes only) for app consumption.
- Football domains are split into features: `home-feed`, `matches`, `teams`, `players`, `leagues`, `standings`, and `search`.
- Data ingestion from vendor HTTP/WS is internal (no public write routes).
- Ingestion concerns live under `src/features/ingestion/`.
- Repositories are feature-owned (for example, team queries live in `src/features/teams/repositories/`).
- Ingestion workers are controlled by env flags and write into PostgreSQL through ingest repositories.

## Adding a New Domain

1. Create `src/features/<feature>/routes/`, `controllers/`, `usecases/`, and `repositories/`
2. For each usecase file, export `<UsecaseName>InputSchema` and `<UsecaseName>OutputSchema` (TypeBox), derive TS types from them, inject repository dependencies in constructor, and implement one `invoke()` method
3. Add repository model interfaces in `src/features/<feature>/repositories/<name>DbModel.ts`
4. Register feature routes in `src/app/routes/index.ts` with the API prefix
5. Add cross-feature shared code to `src/app/` only when it is genuinely shared
