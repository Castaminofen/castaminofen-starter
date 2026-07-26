# Castaminofen

Castaminofen is a mobile-first podcast platform built as a monorepo. The repository currently contains a Next.js web application, a NestJS API, shared TypeScript types, and local infrastructure for PostgreSQL, Redis, and MinIO.

## Project Overview

Castaminofen is intended to support podcast discovery, browsing, and listening workflows in a modern web experience. The current repository focuses on the foundational structure for the platform: authentication, podcast and episode management, library and playlist areas, and the shared infrastructure needed to support future playback and offline experiences.

At a high level, the project is organized as:

- a frontend application for the user experience
- a backend API for business logic and data access
- a shared types package for common contracts
- local Docker services for database and storage dependencies

The current architecture is a simple monorepo with clear separation between the web app and API, while keeping shared code centralized where it is reused.

## Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query
- React Hook Form
- Zod
- Lucide React
- Vitest

### Backend
- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Redis
- MinIO
- JWT-based authentication
- bcrypt
- class-validator / class-transformer
- cookie-parser

### Tooling
- pnpm
- Docker Compose
- ESLint
- Prettier
- TypeScript

## Repository Structure

- apps/web: the Next.js frontend application
- apps/api: the NestJS backend application
- apps/api/prisma: Prisma schema and database modeling
- packages/shared-types: shared TypeScript types used across the workspace
- packages/config: additional shared configuration assets present in the repository
- docker-compose.yml: local services for PostgreSQL, Redis, and MinIO
- docs: project documentation and implementation reports

## Prerequisites

Before running the project locally, make sure you have:

- Git
- pnpm 10.32.1 (declared in the root package manifest)
- Docker and Docker Compose for the local infrastructure services
- A working shell environment with access to the repository

No exact Node.js version is pinned in the repository, so a recent LTS release is the safest choice.

## Available Scripts

The repository exposes scripts at the root and inside the workspace packages.

### Root workspace
- pnpm dev:web — starts the web app
- pnpm dev:api — starts the API in development mode
- pnpm build — builds the shared types package, the web app, and the API
- pnpm lint — runs linting across the workspace
- pnpm lint:web — runs linting for the web app
- pnpm lint:api — runs linting for the API
- pnpm lint:fix — runs ESLint with automatic fixes

### Web app
- pnpm --filter @castaminofen/web dev — starts the Next.js development server
- pnpm --filter @castaminofen/web build — builds the web app
- pnpm --filter @castaminofen/web start — starts the production build
- pnpm --filter @castaminofen/web lint — runs web linting
- pnpm --filter @castaminofen/web test — runs Vitest tests

### API
- pnpm --filter @castaminofen/api start — starts the built API
- pnpm --filter @castaminofen/api start:dev — starts the API in watch mode
- pnpm --filter @castaminofen/api build — builds the API
- pnpm --filter @castaminofen/api lint — runs API linting

### Shared types
- pnpm --filter @castaminofen/shared-types build — builds the shared types package

## Environment Variables

The repository includes environment examples at the root and inside the API package.

| Variable | Purpose | Required | Example |
|---|---|---|---|
| DATABASE_URL | PostgreSQL connection string | Yes | postgresql://postgres:postgres@localhost:5432/castaminofen |
| REDIS_URL | Redis connection string | Yes | redis://localhost:6379 |
| MINIO_ENDPOINT | MinIO endpoint | Yes | http://localhost:9000 |
| MINIO_ACCESS_KEY | MinIO access key | Yes | minioadmin |
| MINIO_SECRET_KEY | MinIO secret key | Yes | minioadmin |
| MINIO_BUCKET | MinIO bucket name | Yes | castaminofen |
| PORT | API port | Yes | 3001 |
| JWT_SECRET | JWT signing secret | Yes | development-jwt-secret |
| JWT_REFRESH_SECRET | JWT refresh signing secret | Yes | development-refresh-secret |
| ACCESS_TOKEN_TTL | API access token lifetime | Yes for the API example file | 15m |
| REFRESH_TOKEN_TTL | API refresh token lifetime | Yes for the API example file | 7d |

Use the files .env.example and apps/api/.env.example as the starting point for local configuration.

## Development Workflow

### 1. Install dependencies
Run:

```bash
pnpm install
```

### 2. Start local infrastructure
The repository includes Docker Compose services for PostgreSQL, Redis, and MinIO:

```bash
docker compose up -d
```

### 3. Configure environment files
Copy the example files to local environment files before starting the apps:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

Adjust the values if your local environment differs from the defaults.

### 4. Start the backend

```bash
pnpm dev:api
```

### 5. Start the frontend

```bash
pnpm dev:web
```

### 6. Build the workspace

```bash
pnpm build
```

### 7. Lint and test

```bash
pnpm lint
pnpm --filter @castaminofen/web test
```

### 8. Prisma workflow
The repository contains a Prisma schema at apps/api/prisma/schema.prisma and Prisma dependencies in the API package. There are no dedicated Prisma migration, db push, generate, or seed scripts defined in the package manifests, so those steps should be verified manually in the local environment.

## Architecture Overview

The project follows a straightforward monorepo structure:

- the web app handles the user interface and routes
- the API handles application logic, validation, and database access
- shared types reduce duplication across the workspace
- Docker services provide the supporting infrastructure needed by the apps

This keeps the platform easy to evolve while preserving a clear separation between frontend and backend responsibilities.

## Contributing

When contributing to this repository:

- keep changes aligned with the existing monorepo structure
- prefer small, focused updates
- use the existing folders and feature boundaries instead of introducing new patterns
- update documentation when behavior or workflows change

## License

No license file was found in the repository at the time of writing.
