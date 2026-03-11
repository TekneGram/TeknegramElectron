Use `electron/db/*` for persistence setup and database access.

Purpose
  - initialize the runtime database at startup
  - run ordered schema migrations
  - provide generic SQLite helpers
  - define table-oriented repository operations

Files
  - `initializeDatabase.ts`
    - startup-time database initialization
  - `runMigrations.ts`
    - ordered SQL migration runner
  - `sqlite.ts`
    - generic DB helpers only
  - `appDatabase.ts`
    - open/close the runtime DB for normal service use
  - `repositories/*`
    - table-oriented SQL operations

Rules
  - Run migrations at startup, not on every request.
  - Keep `sqlite.ts` generic and reusable.
  - Keep repositories SQL-focused and dumb.
  - Repositories should accept a DB handle and perform inserts/selects/updates only.
  - Repositories should return raw row-shaped data, not IPC response DTOs.
  - Repositories should not generate IDs, compute paths, or orchestrate multi-step workflows.
  - Transaction boundaries belong in services.
  - Do not put IPC logic here.
  - Do not put Electron platform UI logic here.
  - Do not put feature orchestration here.

Pattern
  - startup initializes DB and runs migrations
  - services open the DB when needed
  - services call repositories
  - services own transactions and orchestration

Testing
  - Write repository unit tests here and database initialization/migration tests when useful.
  - Prefer a temp or isolated test database setup.
  - Test row shapes and SQL behavior here, not service-level IPC response DTO mapping.
  - Any sqlite unit tests should be mocked and not run with a real database. Real database should only be used on end to end or integration tests.
