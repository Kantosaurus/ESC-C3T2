# Contributing

These guidelines will help the team maintain a consistent codebase and ensure a smooth development process.

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL (if running locally)

## Recommended

- Node version manager (you may run `nvm use` in the project root folder to switch to the project's node version automatically.)

## Development Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   - Copy `.env.example` to `.env` in both frontend and backend packages
   - Fill in the required environment variables

3. Start the development environment:
   ```bash
   docker-compose up -d
   npm run migrate
   npm run dev
   ```

## Developing a Feature

1. Plan

   - Discuss the feature with at least one other team member.
   - Create a document in the `/docs` folder outlining the feature, including any diagrams or sequence flows.
   - Clearly define the problem and how the solution will be implemented.
   - State any assumptions, constraints or scope where applicable.

2. Create a feature branch

   - Use the naming convention `feat/feature-name` (e.g., `feat/caregiver-onboarding`).
   - Branch off from `dev`.

3. If the feature requires database changes:

   - Create a migration script in the `migrations` folder.
   - Migration scripts must be named incrementally (e.g., 1_caregivers.sql`, `2_elderly.sql`).
   - Note that migrations should be idempotent, meaning they can be run multiple times without causing issues. Migrations should not be edited once they are merged into `dev` or `main`.
   - If you need to undo a migration, create a new migration script that reverses the changes of the previous one.
   - Use the `npm run migrate` to run migrations.

4. Implement the feature

   - Write code in the appropriate package (frontend or backend).
   - Ensure to follow the coding standards and conventions outlined in the project.
   - Write tests for your feature if applicable.

5. Commit your changes

   - Use meaningful commit messages following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard.
   - Example: `feat: add onboarding flow`

6. Open a Pull Request (PR)

   - Target the `dev` branch.
   - Provide a clear description of the feature and any relevant context.
   - Request reviews from at least one other team member.
   - Recommended: Use Loom to record a short video explaining the feature and how to test it.

## Reviewing a Pull Request

- Test the feature locally as described in the PR.
- Try to find edge cases and potential issues, that may not have been considered.
- Review the code for adherence to coding standards and project conventions.
- Check for proper documentation and tests.
- Provide constructive feedback and suggestions for improvement.
- If you would like to offer a suggestion that is not essential, prefix the comment with `nit: ` to indicate that it is a minor issue. e.g., `nit: consider renaming this variable for clarity`.
- Once satisfied, approve the PR and merge it into `dev`.
