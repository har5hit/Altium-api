# Code Standards

Fastify coding standards for the Altium iOS project.

## Folder Structure

```
├── src/
│   ├── app/                  # Core + common app code
│   │   ├── app.ts            # Fastify instance setup (buildApp)
│   │   ├── server.ts         # Entry point (starts server)
│   │   ├── di.ts             # DI container (singleton repositories + usecase factories)
│   │   ├── types.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   ├── helpers.ts
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   └── constants.ts
│   │   ├── plugins/
│   │   │   ├── db.ts
│   │   │   ├── auth.ts
│   │   │   ├── redis.ts
│   │   │   ├── swagger.ts
│   │   │   └── index.ts
│   │   ├── routes/
│   │   │   └── index.ts
│   │   └── schemas/
│   │       └── commonSchema.ts
│   │
│   ├── features/             # Feature-layered modules
│   │   ├── users/
│   │   │   ├── models/
│   │   │   │   └── user.ts
│   │   │   ├── routes/
│   │   │   │   └── userRoutes.ts
│   │   │   ├── controllers/
│   │   │   │   └── userController.ts
│   │   │   ├── usecases/
│   │   │   │   ├── CreateUser.ts
│   │   │   │   ├── GetUsers.ts
│   │   │   │   ├── GetUserById.ts
│   │   │   │   └── DeleteUser.ts
│   │   │   └── repositories/
│   │   │       ├── userRepository.ts
│   │   │       └── userDbModel.ts
│   │   ├── home-feed/
│   │   ├── matches/
│   │   ├── teams/
│   │   ├── leagues/
│   │   ├── standings/
│   │   ├── search/
│   │   ├── ingestion/
│   │   │   ├── providers/
│   │   │   ├── repositories/
│   │   │   └── workers/
│   │   └── football-common/
│   │       ├── usecases/
│   │   └── ws/
│   │       └── routes/
│   │           └── wsRoutes.ts
│   │
│   ├── middlewares/          # Reusable Fastify hooks
│   ├── support/              # Shared support utilities (framework-agnostic)
│   └── migrations/           # PostgreSQL schema migrations (SQL)
│
├── tests/
│   └── user.test.ts
│
├── .env.example
├── .gitignore
├── tsconfig.json
├── package.json
├── api-sdk/               # OpenAPI -> client SDK generator module
└── AI.md
```

## Conventions

- **Language:** TypeScript with strict mode
- **Module system:** ESM (`import`/`export`, `"type": "module"`)
- **Imports:** Use absolute alias imports from `@/` for project files (no relative local imports), and keep `.js` extensions for ESM compatibility
- **Class members:** class fields and constructor-injected properties must be `camelCase`
- **Model fields:** all POJO model properties and `*DbModel` interface fields must be `camelCase`
- **Enum members:** enum member names must be `UPPER_SNAKE_CASE`
- **File naming by symbol:** if a file contains only one PascalCase exported symbol (class/interface/enum/const/type), filename must match that symbol name
- **Architecture:** `src/app/` contains app-level core/common code; `src/features/<feature>/` contains feature code
- **Feature pattern:** Each feature contains `routes/`, `controllers/`, `usecases/`, and `repositories/`
- **Data flow:** Route handler -> Controller -> Usecase -> Repository -> PostgreSQL
- **Dependency injection:** `src/app/di.ts` owns app wiring. Repositories are singleton instances; usecases are created per request.
- **Usecases:** One file per use case (example: `CreateUser.ts`) exports `<UsecaseName>InputSchema` and `<UsecaseName>OutputSchema` (TypeBox), derives TS types from those schemas, injects repository dependencies in constructor, and implements one `invoke()` method
- **Repository model naming:** DB model files must live in feature repositories and be suffixed with `DbModel.ts` (example: `userDbModel.ts`)
- **Read-heavy football APIs:** expose only GET routes; split football domains into separate features (`home-feed`, `matches`, `teams`, `leagues`, `standings`, `search`)
- **Football repositories:** repositories stay inside their owning feature; no cross-feature shared read repository class
- **Ingestion design:** external vendor polling/WS consumers live under feature `providers/` + `workers/` and are started from app plugins
- **Types:** Shared app-level interfaces and Fastify augmentation live in `src/app/types.ts`
- **Plugins are conditional:** `db` and `redis` plugins only load when their env vars are set, allowing the server to start without external services during development
- **Support utilities:** put non-app-specific, non-feature-specific helpers in `src/support/` (example: cache primitives like `getOrSetCached`)
- **Schemas:** Route validation schemas must come from usecase `*Schema` exports to keep Swagger and runtime validation in sync; reusable shared schema objects live in `src/app/schemas/` or feature `models/`
- **WebSocket:** `@fastify/websocket` is registered globally in `src/app/app.ts`. WS routes live in `src/features/ws/routes/wsRoutes.ts` and use `{ websocket: true }` on `.get()` handlers
