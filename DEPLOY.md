# Deploy on Render (full site)

This project can run as **one Render Web Service**: website + API together.

| Piece | Where |
|-------|--------|
| Website + API | **Render** Web Service |
| Database | **MongoDB Atlas** |

Repo: https://github.com/GSravan0518/peniel_church_management

---

## 1. MongoDB Atlas (required first)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → create a **free** cluster.
2. Create a database user (username + password).
3. **Network Access** → Add IP Address → allow `0.0.0.0/0` (so Render can connect).
4. Click **Connect** → Drivers → copy the URI, e.g.  
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/peniel_fellowship`

---

## 2. Deploy on Render

1. Open [render.com](https://render.com) → sign in with GitHub.
2. **New** → **Web Service**.
3. Connect repository: `GSravan0518/peniel_church_management`.
4. Settings:

| Setting | Value |
|---------|--------|
| Name | `peniel-fellowship` (or any name) |
| Region | closest to you |
| Branch | `master` |
| Root Directory | *(leave empty)* |
| Runtime | Node |
| Build Command | `npm run build:render` |
| Start Command | `npm start` |
| Instance type | Free |

5. **Environment** variables:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your Atlas connection string |
| `JWT_SECRET` | any long random string |
| `JWT_EXPIRE` | `7d` |
| `CHURCH_NAME` | `Peniel Evangelical Fellowship` |
| `VITE_API_URL` | `/api` |
| `VITE_CHURCH_NAME` | `Peniel Evangelical Fellowship` |

`CLIENT_URL` is optional on Render — the service URL is allowed automatically.

6. Click **Create Web Service** and wait for the build (first build can take several minutes).

7. Open your live URL:  
   `https://peniel-fellowship.onrender.com`  
   (name may differ based on what you chose).

---

## 3. Create admin account (after first deploy)

On your computer (with Atlas URI in `backend/.env`):

```powershell
cd backend
$env:STAFF_ROLE="admin"
$env:STAFF_NAME="Your Name"
$env:STAFF_EMAIL="you@example.com"
$env:STAFF_PHONE="7702096239"
$env:STAFF_PASSWORD="your-secure-password"
npm run create:staff
```

Or use **Render Shell** on the service and run the same with env vars set.

Believers register on the live site at `/register`.

---

## 4. Mobile Google Chrome

1. Open the Render URL in Chrome on your phone.
2. Menu → **Add to Home screen** / **Install app**.

Free Render services may **sleep** after idle time; the first open can take ~30–60 seconds.

---

## 5. Custom domain (optional)

Render → your service → **Settings → Custom Domains** → add `penielevangelicalfellowship.org` and follow the DNS instructions.

---

## Local vs Render

| | Local | Render |
|--|--------|--------|
| API | `http://localhost:5000` | same host as site |
| Web | `http://localhost:5173` | `https://YOUR-APP.onrender.com` |
| `VITE_API_URL` | `http://localhost:5000/api` | `/api` |

Blueprint file: [`render.yaml`](./render.yaml) — you can also use **New → Blueprint** and select this repo.
