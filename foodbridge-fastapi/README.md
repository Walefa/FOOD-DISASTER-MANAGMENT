
# FOOD & DISASTER MANGEMENT — Backend (FastAPI)

FastAPI backend for the FOOD & DISASTER MANGEMENT climate resilience and food security platform .

This service provides REST APIs for disasters, analytics, authentication, coordination and admin tooling. It also exposes WebSocket endpoints for real-time alerts.

## Core Modules

- Disaster alert system (real-time)
- Food security tracking and inventory
- Vulnerability assessment
- Resource coordination and messaging
- Analytics and reporting

## Quick setup (Windows / PowerShell)
1. Create virtual environment and activate it:

```powershell
cd foodbridge-fastapi
python -m venv venv
.\venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Copy environment example and edit `.env` as needed:

```powershell
copy .env.example .env
# Edit .env with your configuration (DB URL, SECRET_KEY, etc.)
```

4. Run database migrations (if using alembic):

```powershell
alembic upgrade head
```

5. Start the development server:

```powershell
uvicorn app.main:app --reload
```

API docs are available after startup:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Admin quick actions
The backend exposes a lightweight admin endpoint used by the frontend admin dashboard:

- POST `/api/v1/admin/backup` — returns a JSON snapshot (safe lightweight export) of current users, active alerts and recent events. The frontend calls this to trigger a download in the browser.

There are also user-management endpoints under `api/v1/auth` used by the admin UI.

## Food-donations (soft-disabled)
An initial implementation for a food-donations feature (farmers donating surplus produce) exists in the codebase. It was intentionally soft-disabled by not mounting the router and removing the public frontend navigation. The source files remain in the repo if you want to re-enable this feature later.

## Real-time WebSockets
The app uses a centralized WebSocket manager (`app/core/websocket.py`) to broadcast disaster alerts and personal notifications. If you see WebSocket close codes like 1006 in the browser, check the backend logs (`uvicorn` output) and firewall/antivirus on the host — those are common causes for abnormal disconnects.

## Code layout

```
app/
├── main.py      # FastAPI entrypoint
├── api/         # Routers (v1)
├── core/        # Config, security, websocket manager
├── db/          # SQLAlchemy session and base
├── models/      # SQLAlchemy models
├── schemas/     # Pydantic schemas
└── scripts/     # helper scripts (seed, tests)
```

## Contributing
- Create a feature branch and open a PR. Include steps to reproduce any backend behavior you change and sample requests if applicable.

---
If you'd like, I can extend the admin backup endpoint to produce server-side downloadable files (e.g., compressed DB export) instead of an in-memory JSON snapshot. Ask and I can implement it.
