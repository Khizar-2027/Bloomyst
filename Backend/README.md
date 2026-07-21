# Bloomyst — Backend

A multi-tenant project management API — think Linear/Asana — built with FastAPI, SQLAlchemy, and JWT auth. Built as a deep-dive learning project covering real backend fundamentals: authentication, role-based authorization, multi-tenant data modeling, file handling, async background jobs, automated testing, and production deployment.

See the [root README](../README.md) for the full project overview (including the React frontend) and live demo links.

## Live Demo

- **API Docs:** https://bloomyst-api.onrender.com/docs

> The backend runs on a free tier and may take 30–60 seconds to wake up on first load after a period of inactivity.

## Tech Stack

- **Framework:** FastAPI
- **ORM / Migrations:** SQLAlchemy, Alembic
- **Auth:** JWT (python-jose), bcrypt password hashing
- **Database:** PostgreSQL, hosted on Neon
- **Email:** SMTP via `smtplib`, sent asynchronously with FastAPI `BackgroundTasks`
- **Testing:** Pytest, with an isolated test database and dependency overrides
- **Frontend:** React, in `../frontend` (see its own README)

## Features

- **Authentication** — registration, login, JWT-based sessions, bcrypt password hashing
- **Multi-tenant workspaces** — users can belong to multiple workspaces, each with an independent role
- **Role-based authorization** — enforced at the API layer via a dependency chain (`get_current_user` → `get_workspace_member` → `require_role()`), not just hidden in the UI or trusted from the client
- **Projects & Tasks** — full CRUD, scoped through project → workspace membership checks
- **Pagination** — `skip`/`limit` query params on task listing
- **File uploads** — user avatars and task attachments, with real validation: content-type checking, size limits, and actually opening the file with Pillow to confirm it's a genuine image (not just a renamed file)
- **Workspace invites** — email-based invites with secure, randomly generated tokens (`secrets.token_urlsafe`), role assignment on invite, and email-match verification before an invite can be accepted
- **Background email** — invite emails sent via `BackgroundTasks`, so the API responds immediately without waiting on SMTP
- **Automated tests** — a Pytest suite covering auth flows and, importantly, authorization boundaries: confirming a non-member genuinely cannot access another workspace's data, and that only `owner`/`admin` roles can send invites
- **Production database** — migrated from SQLite to PostgreSQL via Alembic

## Project Structure

```
app/
├── auth/           # JWT auth: login, register, current-user dependency
├── core/           # config (env vars), database connection, email utility, security (hashing/JWT)
├── users/          # User model, schemas, avatar upload endpoint
├── workspaces/     # Workspace, WorkspaceMember, Invite models; role-based dependencies; invite endpoints
├── projects/       # Project model, schemas, CRUD (scoped to workspace membership)
└── tasks/          # Task model, schemas, CRUD, attachments (scoped to project → workspace membership)

alembic/             # Database migrations
tests/                # Pytest suite (auth, multi-tenancy isolation, role permissions)
```

## Authorization Model

Every workspace-scoped route runs through a dependency chain rather than a single check:

```
get_current_user        →  who is making this request?
get_workspace_member     →  are they actually a member of this workspace, and what's their role?
require_role(...)        →  does their role meet this specific route's requirement?
```

This means authorization is enforced centrally and consistently across every route, rather than re-implemented ad hoc per endpoint — and it's enforced server-side regardless of what the frontend does or doesn't restrict in the UI.

## Running Locally

```bash
python -m venv venv
.\venv\Scripts\Activate      # Windows
pip install -r requirements.txt
```

Create a `.env` file (see `.env.example` for required variables — database URL, JWT secret, SMTP credentials).

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

Visit `http://localhost:8000/docs` for interactive API docs (Swagger UI).

## Running Tests

```bash
pytest -v
```

Tests run against a separate, isolated SQLite database created fresh for each test — your real development/production database is never touched by the test suite.

## Known Limitations

- **File storage:** avatars and task attachments are currently stored on local disk rather than a cloud object store (e.g. AWS S3). This is a deliberate, documented tradeoff — a production deployment on infrastructure with ephemeral disk would need to move this to S3, Cloudinary, or equivalent object storage to prevent uploaded files from being lost on redeploy.
- **Cold starts:** the free-tier deployment sleeps after inactivity; the first request after idle time takes 30–60 seconds to respond.

## Roadmap

- [ ] Real-time task/board updates via WebSockets
- [ ] Workspace activity log / audit trail
- [ ] Full-text search across tasks and projects
