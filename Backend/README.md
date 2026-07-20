# Bloomyst

A multi-tenant project management API — think Linear/Asana — built with FastAPI, SQLAlchemy, and JWT auth. Built as a learning project to go deep on backend fundamentals: authentication, role-based authorization, relational data modeling, and (soon) real-time collaboration.

## Tech Stack
- **Backend:** FastAPI, SQLAlchemy, Alembic
- **Auth:** JWT (python-jose), bcrypt password hashing
- **Database:** SQLite (dev) → PostgreSQL (planned)
- **Frontend:** React (separate repo/folder, in progress)

## Features (so far)
- User registration & login with JWT auth
- Multi-tenant workspaces — users can belong to multiple workspaces with different roles
- Role-based authorization (`owner` / `admin` / `member`) enforced at the API layer via dependency injection

## Planned
- Projects & Tasks (Kanban-style board)
- File uploads (avatars, attachments)
- Real-time updates via WebSockets
- Full-text search
- Deployment (Docker + VPS)

## Running locally

\`\`\`bash
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
\`\`\`

Visit `http://localhost:8000/docs` for interactive API docs.

## Project structure

\`\`\`
app/
  auth/         # JWT auth, login dependencies
  core/         # config, database connection
  users/        # User model, schemas
  workspaces/   # Workspace, WorkspaceMember, role-based dependencies
\`\`\`

## Known Limitations

- **File storage:** Avatars and task attachments are currently stored on local disk rather than cloud object storage (e.g. AWS S3). This works correctly for local development, but would need to move to a persistent/cloud storage solution before a production deployment with ephemeral disk, to prevent uploaded files from being lost on redeploy.

## Live Demo

- **App:** https://bloomyst.vercel.app
- **API Docs:** https://bloomyst-api.onrender.com/docs

> Note: the backend is on a free tier and may take 30-60 seconds to wake up on first load after inactivity.