
Purpose
A concise ruleset and architecture outline for **img\_pre\_processing\_visualizer** — a web app to upload images, apply preprocessing methods, and compare input vs output side-by-side. This is the architecture **for you to build**. Do **not** implement anything here — this file only prescribes structure, rules and priorities.

# 1 — High level architecture (for implementation)

* Frontend: React SPA built with Vite. Docker image `img-preproc-frontend:dev` (or version tag).

  * Responsibilities: upload UI, interactive preprocessing controls, live preview, diff / side-by-side rendering, type-safe client contracts with backend.
* Backend: FastAPI app. Docker image `img-preproc-backend:dev`.

  * Responsibilities: accept uploads, run preprocessing transforms (pluggable pipeline), return processed images or signed URLs, persist metadata, expose OpenAPI for type generation.
* Database: Postgres (official Docker image). Volumes for persistence.
* Orchestration: `docker-compose.yml` to define services: `frontend`, `backend`, `db`, (optional) `worker` for long-running CPU tasks, `minio` or object-store if needed.
* Networking: backend API at `/api/v1/*`. Frontend served separately (dev: Vite dev server; prod: static build + CDN/nginx).
* Storage: store uploaded originals and outputs on disk or object store. Keep pointer + metadata in Postgres.
* Observability: attach metrics/tracing exporter from day one (Prometheus + OpenTelemetry + logs to stdout).

# 2 — Minimal component diagram (text)

Frontend (React/Vite) ↔ FastAPI (REST / OpenAPI) ↔ Postgres
(optional) FastAPI → Worker (same image) for CPU-bound preprocessing
All services orchestrated by docker-compose.

# 3 — Goals & initial tasks (order matters)

1. **E2E type-safety** — single source of truth for types (OpenAPI / codegen or tRPC). Types must flow frontend ↔ backend ↔ DB contracts.
2. **Observability** — structured logs, metrics, traces, error reporting hooks.
3. **CI/CD pipelines** — lint → typecheck → tests → build images → push artifacts → deploy. Pipelines must gate merges.

# 4 — Core principles (rules)

* Never pre-optimize without a reason. Prefer correct, readable, maintainable defaults.
* Get it working first → write tests that assert behavior → refactor/clean up/code split → re-run tests.
* Always refactor before pushing. Small, focused commits make reviews faster.
* Open PRs as **draft**. Always review before marking ready.
* Comments are unnecessary **98%** of the time. Replace comments with descriptive functions/variables or small helper functions.
* Do not write pure SQL strings inline. Use query-builders / typed-ORMs to reduce injection risk and gain type-safety.
* Learn & use higher-order functions (decorators/middleware/wrappers) for monitoring, error handling and profiling. Compose concerns — do not duplicate.
* Keep interfaces small and stable. Prefer backward-compatible changes; break only with clear versioning.

# 5 — Backend design rules

* Expose a complete OpenAPI spec from FastAPI. Use it to generate client types for the frontend.
* Routes should be minimal and composable (e.g., `/api/v1/images` POST, `/api/v1/images/{id}/transform` PUT/POST, `/api/v1/images/{id}` GET).
* Image processing functions must be pure where possible (input bytes → output bytes). Side effects only for storage/DB writes.
* Heavy transforms run in a worker (or background tasks) to keep API responsive. Worker uses same Docker image and shares code.
* Use dependency injection (FastAPI style) for configuration, DB, and observability clients.
* Error handling: wrap handlers with a single middleware that seri

alizes errors and emits metrics & logs. Use higher-order functions for retries/backoff where necessary.
* DB access: prefer typed query-builder or SQLAlchemy Core. Keep raw SQL rare and reviewed.

# 6 — Frontend design rules

* Keep UI stateless where possible. Use local state for controls; sync authoritative state from backend.
* Use generated types from backend OpenAPI (do not duplicate types manually).
* UI must present original and processed images side-by-side and allow toggles: overlay, checkbox diff, slider, histogram. Keep controls composable.
* Provide clear progress & error states for uploads and processing. Log user actions to an analytics/observability endpoint.
* Tests: unit tests with vitest; e2e with Playwright or Cypress validating behavior (not implementation).

# 7 — Storage & DB rules

* Postgres for metadata (users if any, image records, transforms applied, job status). Use a schema migration tool (alembic or equivalent).
* Never store heavy binaries in DB. Store paths/URLs and keep blobs in filesystem or object-store.
* Use parameterized queries via query-builder. No concatenated SQL strings.

# 8 — Testing rules (strict)

* Always test **behavior**, never implementation details. Tests must treat the system like a user or an integrator.
* Test names must use **3rd-person verbs** (e.g., `uploads image and returns processed preview`). Avoid "should".
* Write a test for every bug fixed. Add regression tests before closing bug tickets.
* Abuse `describe` clauses to organize behavior contexts. Group by feature/scenario.
* Unit tests for pure processing functions. Integration tests for API contracts. E2E for upload → transform → view flow.
* CI runs lint → typecheck → tests → build. Pull requests must pass CI before marking ready for review.

# 9 — Observability & monitoring

* Structured logs to stdout (JSON). Emit request id and context.
* Expose Prometheus metrics: request duration, queue length, transform durations, failure counts, CPU/GPU usage.
* Integrate OpenTelemetry tracing to connect frontend→backend→worker traces.
* Capture non-sensitive metadata for errors. Do not log raw image bytes.

# 10 — Security & privacy

* Validate uploads: file type, size, dimensions. Reject or reject gracefully.
* Scan for obvious attempts at payload abuse. Rate-limit uploads per user/IP.
* Use signed URLs or short-lived tokens for direct object-store access.
* Sanitize metadata before persisting. Follow least privilege for DB & storage credentials (env vars + secrets).

# 11 — Dev & Deployment (Docker + Compose)

* Provide three core images in compose:

  * `frontend` — builds React/Vite image, serves static in prod or dev server in dev.
  * `backend` — FastAPI + uvicorn image.
  * `db` — `postgres:XX` official image with volume.
  * Optional: `worker` — same `backend` image launched with worker command.
* Compose file keys: `frontend`, `backend`, `worker?`, `db`, `traefik/nginx?` (optional reverse proxy).
* Use environment files for secrets. Keep credentials out of repository.
* CI builds images, tags them semantically, pushes to registry, then deploys (or publishes compose artifact). Keep deployments repeatable.

# 12 — Developer workflow & git rules

* Feature branches per task. Small PRs. Draft PRs until ready.
* Require at least one code review and passing CI before marking ready.
* Always run full test suite locally (or in a dev container) before marking PR ready.
* Include migration files in PRs that change DB schema. Run migrations in CI.

# 13 — Style & writing rules (docs / code comments / commit messages)

* Cut the bullshit. Be concise. One idea per sentence. Prefer active voice.
* Be human. Address another human. Avoid corporate vagueness.
* Comments: transform into small named helper functions/variables unless the information is non-obvious (very rare).
* Commit messages: short summary line (imperative) + optional body. Link to issue/PR when relevant.

# 14 — Misc engineering conventions

* Lint and typecheck on commit (pre-commit hooks). Fail fast.
* Use feature flags for risky features. Toggle off by default.
* Prefer explicitness over cleverness. Readability > micro-optimizations.
* Document API breaking changes in the release notes and bump API version.

# 15 — Non-functional requirements (brief)

* Latency: UI should feel responsive for small transforms. Long transforms run async (job pattern).
* Scalability: worker pool model for CPU-bound ops. Separate I/O (DB) from processing.
* Reliability: retry with exponential backoff for transient failures. Persist job state to DB.

# 16 — Checklist before any merge to main

* Types generated and typechecks pass front→back.
* Observability hooks present for new endpoints.
* Tests added/updated that assert behavior.
* Migrations included (if any).
* PR opened as draft, reviewed, refactored, tests passing. Mark ready only after review and CI success.
