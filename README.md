# Peniel Evangelical Fellowship

Fully functional MERN church website with separate Believer, Pastor, and Admin portals.

**Deploy** (Vercel + Render + domain `penielevangelicalfellowship.org`): see [DEPLOY.md](./DEPLOY.md).

## Stack

- MongoDB + Mongoose
- Express API
- React (Vite)
- Node.js
- JWT auth

## Environment files

Copy the example files before running:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

### `backend/.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | API port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection | `mongodb://127.0.0.1:27017/peniel_fellowship` |
| `JWT_SECRET` | Secret for auth tokens | long random string |
| `JWT_EXPIRE` | Token lifetime | `7d` |
| `CLIENT_URL` | Frontend URL(s) for CORS (comma-separated OK) | `http://localhost:5173` |
| `CHURCH_NAME` | Ministry name | `Peniel Evangelical Fellowship` |

### `frontend/.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base (include `/api`) | `http://localhost:5000/api` |
| `VITE_CHURCH_NAME` | Display name in the app | `Peniel Evangelical Fellowship` |

> Restart Vite after changing `frontend/.env`.

## Quick start

1. Start MongoDB locally.
2. Install and seed:

```bash
npm run install:all
npm run seed
npm run dev
```

- Website: http://localhost:5173  
- API health: http://localhost:5000/api/health  

## Features

- Sunday services (4 locations) + Holy Communion every first Sunday
- Believers share **prayer requests** and **event bookings** (12-hour time)
- Pastor must **approve** prayers (before public wall) and bookings
- Approved bookings are saved to the **pastor calendar** with 12-hour times
- On the program day, pastor receives **day-of notifications**
- Separate Believer, Pastor, and **Admin** login dashboards
- Admin can upload gallery pictures and monitor users, bookings, prayers, messages
- Mobile-friendly (Chrome on phones) + installable web app manifest
- Gallery, Contact, Peniel scripture quotes

## Accounts (no demo passwords)

- **Believers** register at `/register` with their real name, email, phone, and password.
- **Admin / Pastor** are created once with your real credentials (never stored in the repo):

```powershell
$env:STAFF_ROLE="admin"
$env:STAFF_NAME="Your Name"
$env:STAFF_EMAIL="you@example.com"
$env:STAFF_PHONE="9876543210"
$env:STAFF_PASSWORD="your-secure-password"
npm run create:staff
```

Use `STAFF_ROLE=pastor` for the pastor account. Then sign in at `/login/admin` or `/login/pastor`.

`npm run seed` only clears the database — it does not create any login accounts.

## Main API routes

- `POST /api/auth/register` · `POST /api/auth/login` (`portal`: `believer` \| `pastor` \| `admin`)
- `GET /api/dashboard/admin` · `POST /api/gallery/upload` (admin)
- `GET/POST /api/home-programs` · `PATCH /api/home-programs/:id/status`
- `GET /api/calendar` · `GET /api/calendar/today`
- `GET/POST /api/prayers` · `PATCH /api/prayers/:id/status`
- `GET /api/notifications`
- `GET /api/dashboard/member` · `GET /api/dashboard/pastor`
- `POST /api/contact` · `GET /api/gallery`
