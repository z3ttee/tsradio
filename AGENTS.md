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

## Error Handling

- Always handle exceptions correctly
- Never return hard-coded error messages
- Use the centralized enum `src/errorCodes.ts` for returning error codes in responses. If not exists, create it
