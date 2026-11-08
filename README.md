# To-Do App (MERN)

A task manager with email/password auth, guest demo mode, weekly task navigation (Monday–Sunday), search, and responsive layouts for mobile and desktop.

**Live demo**

- Frontend: [https://app-todoad.netlify.app](https://app-todoad.netlify.app)
- Backend API: hosted on Render (proxied through Netlify as same-origin `/api`)

## Features

- Register, log in, log out (JWT stored in an **httpOnly** cookie)
- **Guest mode** — try the UI with sample tasks in `sessionStorage` (not saved to the database)
- Create, edit, delete, and mark tasks complete
- Home screen grouped by calendar weeks with progress counts
- Search by title, description, or priority
- Mobile: week cards expand to show tasks; desktop: split layout with a task panel

## Tech stack

| Layer | Stack |
|--------|--------|
| Frontend | Next.js 16 (App Router, built on React 19), Tailwind CSS v4, JavaScript |
| Backend | Express 5, Mongoose, MongoDB Atlas |
| Auth | bcrypt + JWT in cookies (`credentials: include` on fetch) |
| Deploy | Netlify (frontend + `/api` rewrite) + Render (API) |

## Project structure

```
app-todo/
├── frontend/          # Next.js app (pages in app/, UI in components/)
│   ├── app/           # Routes: /, /login, /register, /home, /search
│   ├── components/    # Screens and UI pieces
│   ├── context/       # AuthContext, TasksContext
│   ├── hooks/         # useTaskEditor
│   └── lib/           # api.js, dates.js, demoTasks.js, tasks.js
├── backend/           # Express API
│   ├── controllers/   # auth + task handlers
│   ├── middleware/    # requireAuth, errorHandler
│   ├── models/        # User, Task schemas
│   ├── routes/        # Mount paths under /api
│   └── validators/    # Server-side task validation
└── netlify.toml       # Frontend build + Next.js plugin
```

## Local development

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill MONGODB_URI, JWT_SECRET, FRONTEND_URL=http://localhost:3000
npm install
npm run dev
```

API runs at `http://localhost:5000`. Check `GET /api/health`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The client calls `http://localhost:5000` by default (`frontend/lib/api.js`).

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `MONGODB_URI` | Backend | Atlas connection string |
| `JWT_SECRET` | Backend | Signs auth cookies |
| `FRONTEND_URL` | Backend | CORS allowed origin (Netlify URL in production) |
| `NODE_ENV` | Backend | `production` enables `Secure` cookies |
| `PORT` | Backend | Set by Render in production |
| `BACKEND_URL` | Netlify build | Render API root (no trailing slash); enables `/api` rewrites in `next.config.mjs` |
| `NEXT_PUBLIC_API_URL` | Optional | Empty on Netlify (same-origin); `http://localhost:5000` locally |

Never commit real `.env` files.

## API overview

All JSON responses use:

```json
{ "success": true|false, "message": "...", "data": ... }
```

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create account, set cookie |
| POST | `/api/auth/login` | No | Set cookie |
| POST | `/api/auth/logout` | No | Clear cookie |
| GET | `/api/auth/me` | Cookie | Current user |
| GET | `/api/tasks` | Cookie | List tasks (`?from=&to=` optional) |
| POST | `/api/tasks` | Cookie | Create task |
| PATCH | `/api/tasks/:id` | Cookie | Update (owner only) |
| DELETE | `/api/tasks/:id` | Cookie | Delete (owner only) |

## Production architecture

1. Browser loads the Next.js app from Netlify.
2. `fetch('/api/...', { credentials: 'include' })` hits Netlify on the same origin.
3. Netlify rewrites `/api/*` to `BACKEND_URL` (Render).
4. Render validates the JWT cookie and talks to MongoDB.

See `netlify.toml`, `frontend/next.config.mjs`, and `backend/server.js` (CORS + `FRONTEND_URL`).

## What to demo in an interview

1. **Guest mode** — Explore as Guest, edit sample tasks, explain `sessionStorage` vs API.
2. **Register / login** — Cookie auth, why httpOnly beats localStorage for XSS.
3. **Home weeks** — Monday–Sunday grouping (`lib/dates.js`), select week, counts on `WeekCard`.
4. **Create task** — `TaskSheet`, client + server validation.
5. **Complete / swipe delete** — `TaskRow` pointer handlers.
6. **Search** — Client-side filter in `TasksContext.searchTasks`.
7. **Deploy** — Netlify proxy keeps cookies first-party; Render + Atlas env vars.

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| `frontend/` | `npm run dev` | Dev server (port 3000) |
| `frontend/` | `npm run build` | Production build |
| `backend/` | `npm run dev` | API with `--watch` |
| `backend/` | `npm start` | Production API |

## Known limitations

- Render **free tier** sleeps after inactivity; first request may take ~30–50s.
- Guest tasks are lost when the browser tab/session ends.
- Search filters only tasks already loaded in memory (full list on Home/Search).
