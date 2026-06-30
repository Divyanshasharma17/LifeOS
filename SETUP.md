# LifeOS — Setup & Run Guide

This guide assumes you've unzipped the project and have a terminal open
at the project root (the folder containing `backend/` and `frontend/`).

You'll need two terminal windows/tabs open at the same time — one for the
backend, one for the frontend — since both servers run simultaneously.

---

## Prerequisites

- **Python 3.10+** — check with `python3 --version` (or `python --version` on Windows)
- **Node.js 18+** and **npm** — check with `node --version` and `npm --version`

If you don't have these, install Python from https://python.org and Node
from https://nodejs.org first.

---

## Part 1 — Backend (Django)

Open **Terminal 1** and run:

```bash
cd backend
```

### 1. Create and activate a virtual environment

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows (Command Prompt):**
```bat
python -m venv venv
venv\Scripts\activate.bat
```

**Windows (PowerShell):**
```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

You should see `(venv)` appear at the start of your terminal prompt.

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Set up environment variables

```bash
# macOS/Linux
cp .env.example .env

# Windows
copy .env.example .env
```

Open the new `.env` file in any text editor. The defaults work out of the
box. If you'd like the AI Coach to use Gemini instead of the built-in
rule-based engine, paste a free key from
https://aistudio.google.com/app/apikey into `GEMINI_API_KEY=`. Otherwise
just leave it blank — everything still works.

### 4. Run database migrations

```bash
python manage.py migrate
```

You should see a list of `Applying ...OK` lines.

### 5. Create an admin/superuser account

```bash
python manage.py createsuperuser
```

Follow the prompts (username, email, password). This account works for
both the Django admin (`/admin/`) and logging into the LifeOS app itself.

### 6. Start the backend server

```bash
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

Leave this terminal running. The API is now live at `http://localhost:8000/api/`.

---

## Part 2 — Frontend (React + Vite)

Open a **second terminal** (Terminal 2) and run:

```bash
cd frontend
```

### 1. Install dependencies

```bash
npm install
```

This will take a minute the first time.

### 2. Set up environment variables

```bash
# macOS/Linux
cp .env.example .env

# Windows
copy .env.example .env
```

The default `VITE_API_BASE_URL=http://localhost:8000/api` already matches
the backend from Part 1 — no changes needed unless you changed the
backend's port.

### 3. Start the frontend dev server

```bash
npm run dev
```

You should see:
```
  VITE ready in ... ms
  ➜  Local:   http://localhost:5173/
```

### 4. Open the app

Go to **http://localhost:5173** in your browser.

---

## Using the app

1. Click **"Create an account"** and register — or log in with the
   superuser you created in Part 1, Step 5.
2. You'll land on the **Dashboard**. It starts empty, which is normal.
3. Go to **Goals** → "New goal" to create your first goal (try adding a
   deadline a few days out, and a couple of milestones).
4. Go to **Tasks** → "New task" — try both the **List** and **Kanban**
   views, and drag a card between columns in Kanban view.
5. Go to **AI Coach** — ask it "What should I focus on today?" or click
   one of the suggested questions. Check the **Daily/Weekly/Monthly**
   summary tabs and the **goal forecast** card on the right.
6. Toggle light/dark mode from the sun/moon icon in the top bar.

---

## Troubleshooting

**"Failed to fetch" / network errors in the browser console**
Make sure the backend (Terminal 1) is still running and shows no errors.
Check that `frontend/.env` points to the right backend URL.

**CORS errors in the browser console**
Make sure you're opening the frontend at `http://localhost:5173` exactly
(not `127.0.0.1:5173`) — or add your actual origin to
`CORS_ALLOWED_ORIGINS` in `backend/.env`.

**"That port is already in use"**
Another process is using port 8000 or 5173. Either stop it, or run on a
different port:
```bash
python manage.py runserver 8001      # backend
npm run dev -- --port 5174           # frontend (then update frontend/.env)
```

**Migrations fail or the database looks corrupted**
Delete `backend/db.sqlite3` and re-run `python manage.py migrate`, then
`createsuperuser` again (this resets all data).

**I want to reset the AI Coach's chat history**
Use the trash icon in the AI Coach chat panel, or in Django admin under
"Ai coach › Chat messages".

---

## Where things live (admin access)

Django's built-in admin is available at **http://localhost:8000/admin/**
using the superuser credentials from Part 1, Step 5. You can inspect and
edit Users, Goals, Milestones, Tasks, Insights, and Chat Messages directly
from there — useful for debugging or quickly seeding data by hand.
