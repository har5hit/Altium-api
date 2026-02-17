# Code Standards

Fastify coding standards for the Altium iOS project.

## Folder Structure

```
├── src/
│   ├── app.ts                # Fastify instance setup (buildApp)
│   ├── server.ts             # Entry point (starts server)
│   ├── types.ts              # Shared interfaces & Fastify module augmentation
│
│   ├── plugins/              # Fastify plugins
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   ├── redis.ts
│   │   └── index.ts
│
│   ├── routes/               # Route definitions
│   │   ├── index.ts
│   │   ├── users/
│   │   │   ├── routes.ts
│   │   │   ├── controller.ts
│   │   │   └── schema.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── routes.ts
│   │   │   ├── controller.ts
│   │   │   └── schema.ts
│   │   │
│   │   └── ws/
│   │       └── routes.ts          # WebSocket routes
│
│   ├── services/             # Business logic layer
│   │   ├── userService.ts
│   │   └── authService.ts
│
│   ├── repositories/         # DB access layer
│   │   ├── userRepository.ts
│   │   └── authRepository.ts
│
│   ├── middlewares/           # Reusable Fastify hooks
│
│   ├── migrations/           # PostgreSQL schema migrations
│
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   └── helpers.ts
│
│   ├── config/
│   │   ├── env.ts
│   │   └── constants.ts
│
│   └── schemas/              # Shared JSON schemas
│       ├── userSchema.ts
│       └── commonSchema.ts
│
├── tests/
│   ├── user.test.ts
│   └── auth.test.ts
│
├── .env.example
├── .gitignore
├── tsconfig.json
├── package.json
└── CLAUDE.md
```

## Conventions

- **Language:** TypeScript with strict mode
- **Module system:** ESM (`import`/`export`, `"type": "module"`)
- **Imports:** Always use `.js` extensions (required by Node16 module resolution)
- **Route pattern:** Each domain gets its own folder under `routes/` with `routes.ts`, `controller.ts`, `schema.ts`
- **Data flow:** Route handler -> Controller -> Service -> Repository -> PostgreSQL
- **Types:** Shared interfaces live in `src/types.ts`; Fastify instance is augmented there for `config` and custom decorators
- **Plugins are conditional:** `db` and `redis` plugins only load when their env vars are set, allowing the server to start without external services during development
- **Schemas:** Route-specific schemas live in `routes/<domain>/schema.ts`; shared/reusable schemas live in `schemas/`
- **WebSocket:** `@fastify/websocket` is registered globally in `app.ts`. WS routes live in `routes/ws/routes.ts` and use `{ websocket: true }` on `.get()` handlers
