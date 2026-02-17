# AI.md

This file provides guidance to AI Code when working with code in this repository.

## Project Overview

Altium-api is a Fastify-based REST API backend for the Altium iOS app. TypeScript with ESM (`"type": "module"`), PostgreSQL, and Redis.

## Commands

```bash
npm run dev          # run with tsx watch (auto-reload)
npm run build        # compile TypeScript to dist/
npm start            # run compiled output (node dist/server.js)
npm test             # run tests (tsx --test tests/**/*.test.ts)
npx tsc --noEmit     # type-check without emitting
```

## Architecture

Layered architecture with strict separation: Routes -> Services -> Repositories -> DB.

- `src/server.ts` — entry point, calls `buildApp()` and listens
- `src/app.ts` — `buildApp()` assembles the Fastify instance: env, security plugins, app plugins, routes, error handler
- `src/types.ts` — shared interfaces (`User`, `CreateUserInput`, `PaginationQuery`) and Fastify module augmentation for `config` and `verifyApiKey`
- `src/plugins/` — Fastify plugins (db, redis, auth). Registered via `plugins/index.ts` which skips db/redis if their env vars are empty
- `src/routes/<domain>/` — each domain (users, auth) has `routes.ts`, `controller.ts`, `schema.ts`. Controllers instantiate Service+Repository per request context
- `src/services/` — business logic, receives a repository instance
- `src/repositories/` — raw SQL queries against `fastify.pg`
- `src/schemas/` — shared JSON schemas reused across route schemas
- `src/config/env.ts` — `@fastify/env` schema and `EnvConfig` interface (HOST, PORT, DATABASE_URL, REDIS_URL, API_KEY)
- `src/middlewares/` — reusable Fastify hooks
- `src/migrations/` — PostgreSQL schema migrations

## TypeScript

- Strict mode enabled, target ES2022, module Node16
- Use `.js` extensions in imports (required by Node16 module resolution)
- `tsx` is used for dev and tests (no build step needed during development)
- `tsc` compiles to `dist/` for production

## Security

APIs are open by default. Security is provided via:
- `@fastify/helmet` (HTTP headers)
- `@fastify/cors`
- `@fastify/rate-limit` (100 req/min default, configurable in `src/config/constants.ts`)
- Optional API key check: set `API_KEY` env var to enable `x-api-key` header validation (`src/plugins/auth.ts`)

## Adding a New Domain

1. Create `src/routes/<domain>/routes.ts`, `controller.ts`, `schema.ts`
2. Create `src/services/<domain>Service.ts` and `src/repositories/<domain>Repository.ts`
3. Register routes in `src/routes/index.ts` with the API prefix
4. Add shared types to `src/types.ts` and shared schemas to `src/schemas/`
