# Leo Care

Tiny mobile-first web app for tracking daily dog care while we're away.
Brother taps off checklist items and leaves notes; we read along remotely.

## Stack
- **Client:** React + Vite + Tailwind (TypeScript)
- **Server:** Express + JSON-file store (TypeScript) — tiny dataset, no native deps
- **Auth:** none — anyone with the URL can use it

## Local development

```bash
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
npm run dev
```

- Client: http://localhost:5174
- API: http://localhost:3002/api

The dev client proxies `/api/*` to the server.

## Database

JSON file at `data/leocare.json` (override with `LEOCARE_DB_PATH`).
Seeded on first run with default tasks; edit them in the **Tasks** tab.

## Deploying on Render

Create a single **Web Service** from the GitHub repo:

- **Build command:** `npm run render:build`
- **Start command:** `npm run render:start`
- **Environment:** Node 20+

Add a **Persistent Disk** (1 GB is plenty) mounted at `/var/data`,
and set the env var:

```
LEOCARE_DB_PATH=/var/data/leocare.json
```

Without the disk the data file will be wiped on each deploy.

## API quick reference

- `GET  /api/health`
- `GET  /api/tasks` · `POST /api/tasks` · `PATCH /api/tasks/:id` · `DELETE /api/tasks/:id`
- `GET  /api/days` — summary list of days with activity
- `GET  /api/days/:date` — full day (tasks + completions + note)
- `POST /api/days/:date/toggle` — body `{ task_id }`
- `PUT  /api/days/:date/note` — body `{ body }`

Dates are local `YYYY-MM-DD` strings.
