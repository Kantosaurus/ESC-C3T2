# Tech Stack

The tech stack for this project was created with the following key considerations:

- Short Project Duration < 10 weeks
- Medium team size ~7 Devs
- Student Project, optimize for learning outcomes

## Common/Core

### Authentication: [Auth0](https://auth0.com/)

- Reduces configuration overheads
- Handles authentication and authorization
- Compatible with many auth strategies (e.g. email, Singpass)

### Schema Validation: [Zod](https://zod.dev/)

- Framework to declare data schemas easily
- Example: a login form should have:
  - Username: > 3 chars, < 50 chars
  - Password: > 8 chars, one special character
- Can be used on frontend and backend for:
  - Form validation and error handling
  - Endpoint input validation

### Linting: [ESLint](https://eslint.org/)

- Enforces coding guidelines
- Fixes trivial problems automatically
- Automatically runs on commit using a pre-commit hook

### Formatting: [Prettier](https://prettier.io/)

- Handles code styling (indentation, brackets, spaces)
- Automatically runs on commit using a pre-commit hook

### Pre-commit Hook: [Husky](https://typicode.github.io/husky/)

- Runs tasks before every commit (e.g. linting, formatting)
- Can be configured to run tests and check code coverage (optional for school projects)

---

## Frontend

### Framework

- React + Vite (aligns with course content)

### Form Validation

- [React Hook Form](https://react-hook-form.com/)
- Works well with Zod or Yup

### Router: [React Router](https://reactrouter.com/)

- Widely used for Single Page Applications
- Battle tested

### Styling: [Tailwind CSS](https://tailwindcss.com/)

- Ensures consistent styling
- Reduces code verbosity
- Some setup required
- Widely adopted in industry
- [Tutorial](https://youtu.be/6biMWgD6_JY?si=Y2jmsEAtgYk2rCon)

### Testing

- No tests included
- No security benefits from tests in this context
- Component tests are hard to configure
- Overkill for school project

---

## Backend

### Framework

- Express (aligns with course content)

### Testing: [Jest](https://jestjs.io/)

#### Testing Principles

- [Unit vs Integration Testing](https://circleci.com/blog/unit-testing-vs-integration-testing/)
- Unit Testing: essential for core logic
- Integration Testing: useful if business logic resides in SQL queries

---

## Database

### DB Choice

- Just use PostgreSQL  
  [Reference](https://mccue.dev/pages/8-16-24-just-use-postgres)

### Dev Environment

- Use Docker Compose for local development

---

## Documentation

- Each feature/user flow should include a UML or sequence diagram if applicable
- [Sequence Diagram Tutorial](https://creately.com/guides/sequence-diagram-tutorial/)
- Store diagrams and documentation in `/docs` as Markdown files

---

## Monorepo Management

### [NPM Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)

- Enables shared local libraries between frontend and backend (e.g., `core/common` lib)

---

## Git and Pull Requests

### Conventions

- [SE-EDU Git Guide](https://se-education.org/guides/conventions/git.html)
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

### Branch Structure

- `origin/main`: Main branch - auto deploy to production
- `origin/dev`: Development branch - for test deployments
- `origin/feat/*`: Feature branches - for individual features

### Pull Request Workflow

- PRs should be reviewed by at least one teammate
- Feature branches should merge into `dev`

---

## Build

- Frontend and backend are built into a single Docker container
- Backend serves the static frontend

---

## Deployment

- Use [Koyeb](https://app.koyeb.com/) for simplicity
- Can migrate to AWS or other cloud providers if interested in learning cloud configuration
