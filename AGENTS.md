# Project structure

This project has a monorepo structure using `turborepo`. The folder structure looks like this:

- **apps/**: - Main folder containing all frontend apps
  - webplayer/: - Frontend for webplayer features
  - cockpit/: - Frontend for managing the webradio stations
- **services/**: - Main folder containing all backend services/apis
  - api/: - Backend application containing CRUD endpoints for management
  - dex/: - Service that manages/serves local media files for streaming

# General Conventions

- Plan out each step before implementing a solution.
- Follow best practices and consider keeping things simple instead of adding complexity
- Review your changes and check if they match the conventions defined in this respository

# Backend Conventions

## Backend Tech-Stack

- NestJS 10
- NodeJS 24
- TypeScript 5
- TypeORM for database queries

## NestJS

When working on any nestjs service or backend, please follow these conventions:

- Take care of best practices like structuring the code in modules, services, controllers, entities etc.
- Declare function prototypes with their respective access modifiers like public, private, protected
- For async functions, always add "async" instead of returning a plain Promise object
- Add access modifiers to entities. Also consider setting them readonly, if you know that these values are static (like primary keys)
- Private class members or functions should always start with "\_" in their name
- Prefer PUT over PATCH endpoints

## Error Handling

- Always handle exceptions correctly
- Never return hard-coded error messages
- Use the centralized enum `src/errorCodes.ts` for returning error codes in responses. If not exists, create it
