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