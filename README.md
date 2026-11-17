MERN CRUD Blog

A full-stack blog application with a React/Vite frontend and an Express, MongoDB, and Mongoose API. Posts have a title and content; location is an optional browser-only feature and is never sent to or stored by the API.

## Requirements

- Node.js 18 or newer and npm
- A MongoDB database (MongoDB Atlas or a local MongoDB server)

## Configure and run

1. Configure the backend environment. The existing `backend/.env` is local-only and must not be shared or committed. For a fresh setup, copy the example and replace its placeholders:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

   Set `MONGO_URI` to your MongoDB connection string, `DB_NAME` to your database name, and optionally `PORT` (defaults to `3000`). Keep database credentials private. For Atlas, allow network access from your development machine and URL-encode special characters in the database username or password.

2. Install backend packages and start the API:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

   The health route is `http://localhost:3000/`.

3. In a second terminal, configure and start the frontend:

   ```powershell
   cd frontend
   Copy-Item .env.example .env
   npm install
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

The API validates required text fields and MongoDB IDs, uses appropriate success and error status codes, and returns JSON error messages. The browser requests location only after **Allow Location** is clicked; denying it does not affect the blog.

## Production build

```powershell
cd frontend
npm run build
```

The production files are written to `frontend/dist/`. Configure `VITE_API_URL` to the deployed API URL before building for another environment.

## One-repository Git setup

Run these commands from the `mern-crud-app` project root. They prepare one local repository; review the staged files before committing. Do not push or publish without approval.

```powershell
git init
git add .gitignore README.md backend frontend
git status
git commit -m "Build VVIT Experiment 25 MERN CRUD blog"
```

The root and app-level ignore files exclude `.env`, `node_modules`, and build output.
