# Padel-UP — Backend API

> NestJS + PostgreSQL API powering tournament management for Padel-UP — a personal full-stack portfolio project.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3-FE0902?logo=typeorm&logoColor=white)
![Jest](https://img.shields.io/badge/tested%20with-Jest-C21325?logo=jest&logoColor=white)
![License](https://img.shields.io/badge/license-UNLICENSED-lightgrey)

## About

Padel-UP is a tournament management platform for the sport of padel. This repository contains the **backend API**: it handles user authentication, player profiles, and tournament CRUD operations that are consumed by a React Native mobile app and an admin web panel.

This is an MVP built as a **personal portfolio project** — it is not deployed to production and has no real clubs, players, or paying users. The goal is to demonstrate API design, authentication flows, and clean module structure using NestJS conventions.

## Tech Stack

**Core**
- [NestJS 11](https://nestjs.com/) — modular Node.js framework (Express adapter)
- TypeScript 5.7
- [TypeORM](https://typeorm.io/) — ORM with migration-based schema management
- PostgreSQL 15

**Auth**
- Passport.js with `passport-google-oauth20` (Google OAuth 2.0)
- `@nestjs/jwt` / `passport-jwt` — stateless JWT sessions
- Role-based access control via custom guards/decorators

**API & Docs**
- `@nestjs/swagger` — auto-generated OpenAPI docs at `/api`
- `class-validator` / `class-transformer` — DTO validation

**Tooling**
- Jest + Supertest — unit & e2e tests
- ESLint + Prettier
- Docker / Docker Compose (Postgres for local dev, full stack for e2e)
- CircleCI — CI pipeline (test + build)

## Architecture

The project follows NestJS's standard modular architecture: each domain (`auth`, `users`, `tournaments`) is a self-contained module with its own controller, service, repository, entity, and DTOs. Cross-cutting concerns (authentication, role checks) are implemented as guards and decorators reused across modules rather than duplicated per-route.

Database access goes through a thin repository layer on top of TypeORM rather than calling `Repository<T>` directly from services, keeping persistence concerns out of business logic. Schema changes are tracked through versioned TypeORM migrations (no `synchronize` in non-test environments) so the schema evolves predictably.

```
Request → Controller (routing, guards, Swagger docs)
        → Service (business logic)
        → Repository (TypeORM persistence)
        → PostgreSQL
```

## Key Features

- **Google OAuth 2.0 login** with deep-link support — the mobile app passes a `redirect_uri`, which is round-tripped through OAuth `state` so the callback can redirect back into the app with a signed JWT.
- **JWT-based session handling** with a Passport strategy that resolves the authenticated user on every request.
- **Two-step onboarding**: users are created in `PENDING` status from their Google profile, then complete a padel-specific profile (category, dominant hand, preferred court side, etc.) before becoming `ACTIVE`.
- **Role-based authorization** (`PLAYER` / `ADMIN`) enforced via a reusable `RolesGuard` + `@Roles()` decorator.
- **Tournament management**: public listing/detail endpoints, admin-only create/update/delete, with status lifecycle (`UPCOMING` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`).
- **User administration**: admin endpoints to list, inspect, update, and remove users.
- **Auto-generated Swagger/OpenAPI docs** with bearer-auth support for trying protected routes directly.
- **Migration-driven schema management** — no implicit schema sync outside of test environments.

## Project Structure

```
src/
├── auth/
│   ├── strategies/        # Google OAuth & JWT Passport strategies
│   ├── guards/             # JwtAuthGuard, GoogleAuthGuard, RolesGuard
│   ├── decorators/         # @CurrentUser(), @Roles()
│   ├── auth.controller.ts  # /auth/google, /auth/google/callback, /auth/me
│   └── auth.service.ts
├── users/
│   ├── dto/                 # create / update / complete-profile DTOs
│   ├── user.entity.ts       # User entity + role/status/category enums
│   ├── users.repository.ts
│   ├── users.service.ts
│   └── users.controller.ts
├── tournaments/
│   ├── dto/
│   ├── tournament.entity.ts # Tournament entity + status enum
│   ├── tournament.repository.ts
│   ├── tournament.service.ts
│   └── tournament.controller.ts
├── database/
│   └── database.module.ts   # TypeORM root module
├── migrations/               # Versioned schema migrations
├── app.module.ts
└── main.ts                   # Bootstrap, CORS, Swagger setup

config/
└── data-source.ts            # TypeORM CLI data source (used by migrations)

test/
├── *.e2e-spec.ts
└── helpers/test-app.helpers.ts
```

## Getting Started

### Prerequisites

- Node.js `20.11.1` (see `.nvmrc`)
- Docker & Docker Compose (for PostgreSQL)
- A Google OAuth 2.0 client ID/secret ([Google Cloud Console](https://console.cloud.google.com/))

### Installation

```bash
git clone git@github.com:ManuelForneri/PadelUP-Back.git
cd PadelUP-Back
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# Server
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=padelup_db
DATABASE_SYNCHRONIZE=false

# Auth
JWT_SECRET=replace-with-a-strong-random-secret
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### Running locally

```bash
# Start PostgreSQL
docker-compose up -d
# or: sh up_dev.sh

# Run pending migrations
npm run migration:run

# Start the API in watch mode
npm run start:dev
```

The API will be available at `http://localhost:3000`, with interactive Swagger docs at `http://localhost:3000/api`.

### Database migrations

```bash
npm run migration:generate   # generate a migration from entity changes
npm run migration:run        # apply pending migrations
npm run migration:revert     # roll back the last migration
```

### Tests

```bash
npm run test        # unit tests
npm run test:e2e     # e2e tests (spins up via docker-compose.test.yml in CI)
npm run test:cov     # tests with coverage
```

## Related Repositories

- **Mobile app (frontend)** — React Native / Expo client consuming this API: _link TBD_
- **Admin web panel** — web dashboard for managing tournaments and users: _link TBD_

## Roadmap

- Tournament bracket / draw generation
- Player ranking system based on tournament results
- Match scheduling and score reporting

## Author

**Manuel Forneri** — Full Stack Developer

- GitHub: [@ManuelForneri](https://github.com/ManuelForneri)
- Portfolio: [manuelforneri.vercel.app](https://manuelforneri.vercel.app)
- LinkedIn: [Manuel Forneri](https://www.linkedin.com/in/manuel-forneri/)