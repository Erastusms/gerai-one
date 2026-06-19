# Backend Architecture

The backend is built as a modular Fastify application adhering to Domain/Feature ownership rules (colocation).

## Key Characteristics

1. **Feature-Based Module Folder Structure**:
   All files implementing a given feature (Routes, Controllers, Services, Repositories, Schemas, and Swagger specs) are grouped inside their respective feature folder under `src/modules/`.

2. **Source of Truth Sync**:
   User profiles are created/updated dynamically when Clerk sends webhook events. The local database acts as the single source of truth for downstream domain logic.

3. **Core Layers (Shared)**:
   * **Prisma Client**: Singular database instance configuration.
   * **Structured Pino Logger**: Customized logger format tracking request timings and contexts.
   * **Authentication Middleware**: Resolves JWTs via Clerk Backend SDK.
