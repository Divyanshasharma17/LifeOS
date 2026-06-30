# LifeOS — AI-Powered Personal Operating System

LifeOS is a full-stack productivity platform that centralizes goals, tasks,
and an AI Coach into one dashboard. This delivery contains the **core
foundation**: Accounts, Dashboard, Goals, Tasks, and the AI Coach — fully
built, tested, and wired end-to-end. Study, Focus Timer, Habits, Health,
Mood, and Journal are planned as a follow-up build on the same architecture
(see "Roadmap" below).

## Tech stack

| Layer        | Technology |
|--------------|------------|
| Backend      | Django 6, Django REST Framework, SQLite3 |
| Auth         | JWT (djangorestframework-simplejwt), with refresh + blacklist |
| AI Engine    | Google Gemini (free tier) with an automatic rule-based fallback |
| Frontend     | React 19 + Vite, React Router 7 |
| HTTP client  | Fetch API only — no Axios anywhere in the codebase |
| Charts/icons | Recharts, lucide-react |
| Styling      | Hand-written CSS with design tokens; light + dark mode |

## What's included in this build

- **Accounts**: registration, login (username or email), JWT logout with
  token blacklisting, profile view/update, change password.
- **Dashboard**: a single aggregated endpoint powering the home screen —
  stat cards, upcoming deadlines (goals + tasks merged), recent activity.
- **Goals**: full CRUD, categories, priorities, status, progress %,
  deadlines, and nested milestones with their own completion tracking.
- **Tasks**: full CRUD, both **list view** (filterable, searchable) and
  **kanban view** (drag-and-drop across To Do / In Progress / Review / Done),
  bulk reorder endpoint, stats endpoint.
- **AI Coach**: the centerpiece. Builds a structured snapshot of the user's
  goals/tasks, then either calls **Gemini** (if `GEMINI_API_KEY` is set) or
  falls back to a deterministic **rule-based engine** — every endpoint always
  returns a real, contextual answer, with or without an API key.
  - Recommendations (ranked by urgency: overdue → stalled → upcoming)
  - Daily / weekly / monthly performance summaries
  - Goal completion forecasts (heuristic verdict per goal)
  - A chatbot with persisted history that answers the four example
    questions from the spec ("What should I focus on today?", "Which goals
    are falling behind?", "How can I improve my productivity?", "What
    habits should I prioritize?") plus general follow-ups.

## Project structure

```
lifeos/
├── backend/
│   ├── config/             # Django project settings, root urls
│   ├── accounts/           # Custom user model, JWT auth, profile
│   ├── dashboard/          # Aggregation views (no models of its own)
│   ├── goals/               # Goal + Milestone models, serializers, views
│   ├── tasks/               # Task model, list/kanban/reorder/stats views
│   ├── ai_coach/            # context_builder, rule_engine, gemini_engine,
│   │                         engine (facade), Insight + ChatMessage models
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/             # client.js (Fetch wrapper + JWT refresh),
    │   │                     one module per domain (auth, goals, tasks, ...)
    │   ├── components/      # common/, layout/, goals/, tasks/, dashboard/, ai/
    │   ├── context/         # AuthContext, ThemeContext, ToastContext
    │   ├── hooks/            # useApi (generic fetch/loading/error hook)
    │   ├── pages/            # one file per route
    │   └── styles/           # tokens.css (design system) + one file per page
    └── .env.example
```

## Database schema (this build)

```
User (custom)
 ├─ id, username, email, first_name, last_name
 ├─ bio, avatar_color, timezone, daily_goal_minutes, onboarding_complete
 └─ created_at, updated_at

Goal
 ├─ user → User
 ├─ title, description, category, priority, status, progress (0-100)
 ├─ start_date, deadline, completed_at
 └─ created_at, updated_at

Milestone
 ├─ goal → Goal
 ├─ title, is_completed, due_date, order
 └─ created_at, completed_at

Task
 ├─ user → User
 ├─ goal → Goal (nullable — optional link)
 ├─ title, description, category, priority, status, due_date
 ├─ order (kanban column position)
 └─ completed_at, created_at, updated_at

Insight (AI Coach cache — used for admin visibility / future caching)
 ├─ user → User
 ├─ kind, title, body, source ('gemini' | 'rule_based'), metadata (JSON)
 └─ created_at

ChatMessage
 ├─ user → User
 ├─ role ('user' | 'assistant'), content
 └─ created_at
```

## API endpoints

```
POST   /api/auth/register/
POST   /api/auth/login/                 (accepts username OR email)
POST   /api/auth/login/refresh/
POST   /api/auth/logout/
GET    /api/auth/profile/
PATCH  /api/auth/profile/
POST   /api/auth/change-password/

GET    /api/dashboard/overview/

GET    /api/goals/                      ?status=&priority=&category=&search=
POST   /api/goals/
GET    /api/goals/{id}/
PATCH  /api/goals/{id}/
DELETE /api/goals/{id}/
GET    /api/goals/stats/
POST   /api/milestones/
PATCH  /api/milestones/{id}/
DELETE /api/milestones/{id}/

GET    /api/tasks/                      ?status=&priority=&category=&search=
POST   /api/tasks/
GET    /api/tasks/{id}/
PATCH  /api/tasks/{id}/
DELETE /api/tasks/{id}/
GET    /api/tasks/board/                (grouped by kanban column)
POST   /api/tasks/reorder/              (bulk drag-and-drop persistence)
GET    /api/tasks/stats/

GET    /api/ai/recommendations/
GET    /api/ai/summary/daily/
GET    /api/ai/summary/weekly/
GET    /api/ai/summary/monthly/
GET    /api/ai/goal-forecast/
GET    /api/ai/chat/                    (history)
POST   /api/ai/chat/                    (send message, get reply)
DELETE /api/ai/chat/                    (clear history)
GET    /api/ai/status/                  ('gemini' or 'rule_based')
```

## State management strategy

- **Server state** (goals, tasks, dashboard, AI data) is fetched on demand
  via the `useApi` hook — no global cache/store; each page owns its data
  and calls `refetch()` after mutations. This keeps the mental model simple
  for a portfolio-scale app while still feeling instant (optimistic updates
  are used for kanban drag-and-drop).
- **Client/global state** (current user, JWT tokens, theme, toasts) lives in
  three small React Context providers: `AuthContext`, `ThemeContext`,
  `ToastContext`. No Redux/Zustand — intentionally, to keep the dependency
  surface minimal and the data flow easy to follow in a code review.

## Authentication flow

1. `POST /api/auth/register/` or `/login/` returns `{ access, refresh, user }`.
2. Both tokens are stored in `localStorage` (`client.js`).
3. Every request via `api.*` attaches `Authorization: Bearer <access>`.
4. On a `401`, `client.js` automatically calls `/login/refresh/` once, retries
   the original request, and only logs the user out if the refresh itself
   fails (refresh token expired/blacklisted).
5. `AuthContext` loads `/api/auth/profile/` on mount to restore the session
   if a valid token is already in storage (e.g. after a page reload).

## AI integration logic

`ai_coach/context_builder.py` is the single source of truth: it queries
Goals and Tasks for the current user and returns one structured dict. Both
backends consume exactly this dict, so behavior is consistent no matter
which one answers:

- `ai_coach/rule_engine.py` — pure Python, deterministic, zero external
  calls. Always available.
- `ai_coach/gemini_engine.py` — calls Gemini with that same context
  JSON-encoded into the prompt, asks for structured (JSON) or plain-text
  output depending on the endpoint, and **falls back to `rule_engine` on
  any failure** (missing key, network error, malformed response, quota).
- `ai_coach/engine.py` — the only module views import from; it decides
  which backend is active and returns `(result, source)` so the frontend
  can show "Gemini" vs "Rule engine" as a badge.

## Getting a free Gemini API key (optional)

The AI Coach works immediately with **no key at all** — you'll just see a
"Rule engine" badge instead of "Gemini" in the UI. To enable Gemini:

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with a Google account and click "Create API key" (free tier).
3. Paste it into `backend/.env` as `GEMINI_API_KEY=...`
4. Restart the Django server.

## Roadmap — next delivery

The following modules are designed into the data model and AI context
already (see the reserved keys in `context_builder.py` and the dashboard's
`stats` payload) but not yet built in this delivery:

1. **Study Tracker** — sessions (subject, topic, duration, notes), progress
   over time, charted study hours.
2. **Focus Timer** — Pomodoro-style timer, session history, daily focus
   minutes feeding into the dashboard stat card that's already wired.
3. **Habits** — daily/weekly habits, streak counting, "at risk" detection
   for the AI Coach.
4. **Health** — sleep, water intake, exercise, weight logs with trend charts.
5. **Mood** — mood + energy + stress logging, weekly mood average already
   has a placeholder on the dashboard.
6. **Journal** — daily reflections and gratitude entries, optionally
   summarized by the AI Coach in weekly/monthly summaries.

Each will follow the exact same pattern as Goals/Tasks (models →
serializers → viewset → urls → React page), so adding them is mechanical
once you're comfortable with this codebase.

## Step-by-step: how to run this project

See **SETUP.md** for full, copy-pasteable setup instructions for both the
backend and frontend, including how to create a superuser and (optionally)
seed demo data.
