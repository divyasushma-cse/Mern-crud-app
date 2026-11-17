## React + Neon CRUD Blog

A React/Vite blog frontend with an Express API and Neon serverless PostgreSQL database. Posts have a title and content. Location is an optional browser-only feature and is never sent to or stored by the API.

## Requirements

- Node.js 18 or newer and npm
- A Neon PostgreSQL project (no local database is required)

## Configure and run

1. Create a Neon project and copy its connection string from the Neon dashboard.
2. Configure the backend environment. Keep `backend/.env` private and never commit it:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

   Set `DATABASE_URL` in `backend/.env` to the Neon connection string, including `sslmode=require`. The connection string is a secret; do not put it in frontend variables or source control.

3. Install backend packages and start the API:

   ```powershell
   cd backend
   npm ci
   npm run dev
   ```

   The health route is `http://localhost:3000/`. The API creates the `posts` table on startup if it does not exist.

4. In a second terminal, configure and start the frontend:

   ```powershell
   cd frontend
   Copy-Item .env.example .env
   npm ci
   npm run dev
   ```

   `VITE_API_URL` should point to the API base URL, normally `http://localhost:3000/api/v1`. Open the URL printed by Vite (normally `http://localhost:5173`).

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | API health/welcome message |
| POST | `/api/v1/posts` | Create a post (`title`, `content`) |
| GET | `/api/v1/posts` | List posts |
| GET | `/api/v1/posts/:id` | Get a post |
| PUT | `/api/v1/posts/:id` | Update a post (`title`, `content`) |
| DELETE | `/api/v1/posts/:id` | Delete a post |

Post IDs are UUIDs. The API validates required text fields and IDs, uses appropriate success and error status codes, and returns JSON error messages. The browser requests location only after **Allow Location** is clicked; denying it does not affect the blog.

## Deploy the backend to Render

- Create a Node Web Service for this repository on branch `main`.
- Set **Root Directory** to `backend`, **Build Command** to `npm ci`, and **Start Command** to `npm start`.
- Add `DATABASE_URL` in Render's environment settings using the Neon connection string. Never add it as a `VITE_` variable or commit it.
- Render supplies `PORT` automatically. After deployment, verify the service URL at `/`.

The CRUD API currently has no authentication. Do not use it for sensitive or private data without adding authentication and authorization.

## Frontend production build

```powershell
cd frontend
npm run build
```

The production files are written to `frontend/dist/`. Configure `VITE_API_URL` to the deployed API base URL before building the frontend for production.

The repository ignores `.env` files, `node_modules`, and build output. Commit only `.env.example` templates, never private connection strings.
