# DashPro Server

This folder contains a minimal Node/Express + Mongoose backend for DashPro.

Quick start

1. Install dependencies (from repo root or inside server):

```bash
cd server
pnpm install
```

2. Create `.env` based on `.env.example` and set `MONGO_URI` and `JWT_SECRET`.

3. Start in development:

```bash
pnpm run dev
```

4. The server runs on `http://localhost:4000` by default. API endpoints:

- `POST /api/auth/register` { name, email, password }
- `POST /api/auth/login` { email, password }
- `GET /api/attendance/` (requires Authorization: Bearer <token>)
- `POST /api/attendance/checkin` (requires token) { location, notes }
- `PUT /api/attendance/checkout/:id` (requires token) { notes }

Next steps

- Hook up the frontend to call these endpoints and replace localStorage persistence.
- Add validation (e.g. express-validator), rate limiting, and tests.
