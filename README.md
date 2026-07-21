# Bloomyst

A multi-tenant project management platform — think Linear/Asana — built from scratch with **FastAPI + React**. Built as a deep-dive learning project covering real backend fundamentals: authentication, role-based authorization, multi-tenancy, file handling, async background jobs, automated testing, and full deployment.

## Live Demo

- **App:** https://bloomyst.vercel.app
- **API Docs:** https://bloomyst-api.onrender.com/docs

> The backend runs on a free tier and may take 30–60 seconds to wake up on first load after a period of inactivity.

## What it does

Users create a **Workspace**, invite teammates with role-based permissions (`owner` / `admin` / `member`), organize work into **Projects**, and manage **Tasks** on a drag-and-drop Kanban board — with file attachments, avatars, and email-based invites.

## Tech Stack

**Backend**
- FastAPI, SQLAlchemy, Alembic
- JWT authentication (python-jose), bcrypt password hashing
- PostgreSQL (hosted on Neon)
- Pytest test suite (auth, multi-tenancy isolation, role-based permissions)
- Background email via `BackgroundTasks` + SMTP

**Frontend**
- React (Vite)
- Tailwind CSS
- `@dnd-kit` for drag-and-drop
- React Router, Axios

**Infrastructure**
- Backend deployed on Render
- Frontend deployed on Vercel
- Database hosted on Neon (Postgres)

## Features

- **Authentication** — registration, login, JWT-based sessions, bcrypt password hashing
- **Multi-tenant workspaces** — users belong to multiple workspaces, each with an independent role
- **Role-based authorization** — enforced at the API layer via dependency injection (`get_current_user` → `get_workspace_member` → `require_role()`), not just hidden in the UI
- **Projects & Tasks** — full CRUD, scoped to workspace membership
- **Kanban board** — drag-and-drop task management across To Do / In Progress / Done, built with `@dnd-kit`
- **File uploads** — user avatars and task attachments, with real validation (file type, size limits, image verification)
- **Workspace invites** — email-based invites with secure token links, role assignment, and email-match verification on accept
- **Background email** — invite notifications sent asynchronously via FastAPI `BackgroundTasks`, so requests don't block on SMTP
- **Automated tests** — Pytest suite covering auth flows and, critically, authorization boundaries (e.g. confirming a non-member genuinely cannot access another workspace's data)
- **Production database** — migrated from SQLite to PostgreSQL via Alembic

## Project Structure

```
Bloomyst/
├── Backend/
│   ├── app/
│   │   ├── auth/          # JWT auth, login, current-user dependency
│   │   ├── core/          # config, database connection, email, security
│   │   ├── users/         # User model, schemas, avatar upload
│   │   ├── workspaces/    # Workspace, WorkspaceMember, Invite, role-based dependencies
│   │   ├── projects/      # Project model, CRUD
│   │   └── tasks/         # Task model, CRUD, attachments
│   ├── alembic/           # Database migrations
│   ├── tests/             # Pytest suite
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/          # Login, Register, Dashboard, WorkspaceDetail, ProjectDetail
    │   ├── components/     # BoardColumn, TaskCard, TaskModal, ProtectedRoute
    │   └── api/            # API client + per-resource request functions
    └── package.json
```

## Running Locally

### Backend

```bash
cd Backend
python -m venv venv
.\venv\Scripts\Activate      # Windows
pip install -r requirements.txt
```

Create a `.env` file (see `.env.example` for the required variables), then:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`.

Run tests:
```bash
pytest -v
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file (see `.env.example`):
```
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

App available at `http://localhost:5173`.

## Known Limitations

- **File storage:** avatars and task attachments are currently stored on local disk rather than a cloud object store (e.g. AWS S3). This is a deliberate tradeoff for this project — file storage on the free-tier deployment is not guaranteed to persist across redeploys. A production deployment would move this to S3, Cloudinary, or equivalent object storage.
- **Cold starts:** the backend free tier sleeps after inactivity; the first request after a period of idle time takes 30–60 seconds to respond.

## Roadmap

- [ ] Real-time board updates via WebSockets
- [ ] Workspace activity log / audit trail
- [ ] Full-text search across tasks and projects

## What This Project Demonstrates

- Multi-tenant architecture with genuine data isolation between workspaces
- Role-based access control enforced server-side, not just in the UI
- Secure file upload handling (validation, unique naming, cleanup of orphaned files)
- Async background processing for non-blocking email delivery
- A real production database migration (SQLite → PostgreSQL)
- Automated testing of security-critical logic (authorization boundaries), not just happy-path CRUD
- End-to-end deployment across separate frontend/backend hosts with proper environment configuration and CORS