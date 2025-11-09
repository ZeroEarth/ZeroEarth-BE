# Repository Guidelines

## Project Structure & Module Organization
- `src/app.js` bootstraps Express, wires middleware, and schedules cron jobs; treat it as the single entry point.
- Domain logic lives in `controllers`, `services`, `repositories`, `routes`, `middlewares`, `validations`, and `utils`; add new files by mirroring this separation of concerns.
- Infrastructure artifacts sit in `config/` (env + database), `dbschema.sql` (schema), `seed_data/` (fixtures), and the Docker files that orchestrate Node + Postgres.
- Static assets currently flow through Azure Blob helpers inside `services`; store cross-cutting helpers under `utils/` when expanding that surface area.

## Build, Test, and Development Commands
- `npm install` installs runtime dependencies; rerun whenever package manifests change.
- `npm start` or `node src/app.js` runs the API directly against your local Postgres—handy for debugger attachments.
- `docker-compose up --build` reproduces the full stack (API + PostgreSQL) including schema seeding; prefer this for end-to-end verification.
- `npm test` is a placeholder right now—replace it with your Jest/Mocha runner before merging changes that rely on automation.

## Coding Style & Naming Conventions
- Stick to CommonJS, 4-space indentation, semicolons, and single quotes except where JSON requires double quotes.
- Name layers consistently: `routes/<resource>.js`, `controllers/<resource>Controller.js`, `services/<resource>Service.js`, `repositories/<resource>Repository.js`.
- Read configuration centrally via `config/` modules and inject plain objects into downstream layers instead of hitting `process.env` directly.

## Testing Guidelines
- Adopt Jest (recommended) and wire it to `npm test`; capture unit tests for services/repositories and light integration tests for controllers/routes.
- Name spec files `<feature>.spec.js` and co-locate them under `src/__tests__/` or beside the module for easy importing.
- Mock Postgres and Azure Blob access by stubbing the repository/service layer so tests run without Docker.

## Commit & Pull Request Guidelines
- Use short imperative commits (`feat: add cattle feed scheduler`) and avoid batching unrelated changes.
- PRs should explain the problem, solution, schema/env adjustments, and how you validated the change (e.g., `docker-compose up --build`, sample cURL output).
- Reference issues or tickets and attach screenshots/log snippets when API behavior or cron output changes.

## Security & Configuration Tips
- Keep secrets in `.env` and never commit that file; follow the keys listed in `README.md` when creating new entries.
- Rotate Azure storage keys and database credentials in the cloud after sharing debug artifacts externally.
