# Bloomyst — Frontend

React (Vite) frontend for Bloomyst, a multi-tenant project management app. See the [root README](../README.md) for the full project overview, live demo links, and backend setup.

## Tech Stack

- React (Vite)
- Tailwind CSS
- `@dnd-kit` — drag-and-drop for the Kanban board
- React Router — client-side routing
- Axios — API requests

## Features

- Login / Register with JWT-based auth (token stored client-side, attached automatically to every request)
- Protected routes — redirects to login if no valid session
- Dashboard — list and create workspaces, upload/change avatar
- Workspace detail — list and create projects, invite members by email with role selection
- Project board — drag-and-drop Kanban board (To Do / In Progress / Done), inline per-column task creation, priority editing
- Task modal — full task details, file attachments (upload, view, delete)
- Invite acceptance flow — handles email-based workspace invite links

## Project Structure

```
src/
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx          # Workspace list + creation, avatar upload
│   ├── WorkspaceDetail.jsx    # Project list + creation, invite form
│   ├── ProjectDetail.jsx      # The Kanban board
│   └── AcceptInvite.jsx       # Invite link landing page
├── components/
│   ├── BoardColumn.jsx
│   ├── TaskCard.jsx
│   ├── TaskModal.jsx          # Task details + attachments
│   └── ProtectedRoute.jsx
└── api/
    ├── client.js               # Axios instance, auth token interceptor
    ├── auth.js
    ├── workspaces.js
    ├── projects.js
    ├── tasks.js
    ├── invites.js
    ├── users.js
    └── attachments.js
```

## Running Locally

```bash
npm install
```

Create a `.env` file:
```
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Visit `http://localhost:5173`. Requires the backend running (see root README) for the app to function.

## Notes on Key Implementation Details

- **Drag-and-drop:** built with `@dnd-kit`. Draggable cards use `useSortable`; columns are drop zones via `useDroppable`. A `PointerSensor` activation distance prevents accidental drags from interfering with clicks on buttons/dropdowns inside cards.
- **Optimistic updates:** moving a task between columns updates local state immediately, then confirms with the backend — falls back to a fresh fetch if the request fails, so the UI never feels laggy waiting on a network round-trip.
- **Routing:** `vercel.json` includes a rewrite rule so client-side routes (e.g. `/dashboard`, `/workspaces/:id`) resolve correctly on refresh/direct navigation, not just in-app clicks.