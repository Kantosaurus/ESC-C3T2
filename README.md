# carely

Carely aims to reduce administrative burden and cognitive load for caregivers so that they can focus on caregiving.

## Tech Stack

see [docs/tech-stack.md](./docs/tech-stack.md) for a more detailed overview of our tech stack.

### Frontend

- React + Vite
- React Router
- React Hook Form with Zod
- Tailwind CSS
- Auth0 for authentication

### Backend

- Express.js
- PostgreSQL
- Jest for testing
- Auth0 integration

## Project Structure

```
.
├── packages/
│   ├── frontend/     # React + Vite application
│   ├── backend/      # Express.js server
│   └── core/       # Shared types and utilities
```

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL (if running locally)
- Auth0 account

## Recommended

- Node version manager (you may run `nvm use` in the project root folder to switch to the project's node version automatically.)

## Development Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   - Copy `.env.example` to `.env` in the root directory.
   - Fill in the required environment variables

3. Start the development environment:
   ```bash
   docker-compose up -d
   npm run migrate
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start all packages in development mode
- `npm run build` - Build all packages
- `npm run test` - Run tests across all packages
- `npm run lint` - Lint all packages
- `npm run migrate` - Run database migrations
- `npm run clean` - Clear database and reset migrations

## Documentation

Each feature/user flow is documented with UML/Sequence diagrams in the respective package's `docs` directory.
