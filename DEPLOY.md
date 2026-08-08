# Deploy Peniel Evangelical Fellowship

Recommended setup for **penielevangelicalfellowship.org**:

| Piece | Host |
|-------|------|
| Frontend (React/Vite) | **Vercel** |
| Backend (Express API) | **Render** |
| Database | **MongoDB Atlas** |
| Domain | `penielevangelicalfellowship.org` |

## 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow network access (`0.0.0.0/0` for Render).
3. Copy the connection string, e.g.  
   `mongodb+srv://USER:PASS@cluster.mongodb.net/peniel_fellowship`

## 2. Backend on Render

1. Push this repo to GitHub.
2. In Render: **New → Web Service** → connect the repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/peniel_fellowship
JWT_SECRET=long-random-secret
JWT_EXPIRE=7d
CLIENT_URL=https://penielevangelicalfellowship.org,https://www.penielevangelicalfellowship.org
CHURCH_NAME=Peniel Evangelical Fellowship
```

5. After deploy, note your API URL, e.g. `https://peniel-api.onrender.com`.
6. Clear any old sample data (optional), then create your real admin/pastor:

```bash
cd backend
# MONGODB_URI must point at Atlas in .env
npm run seed
# Then create staff with YOUR identity (no demo passwords):
# STAFF_ROLE=admin STAFF_NAME="..." STAFF_EMAIL="..." STAFF_PHONE="..." STAFF_PASSWORD="..." npm run create:staff
# STAFF_ROLE=pastor STAFF_NAME="..." STAFF_EMAIL="..." STAFF_PHONE="..." STAFF_PASSWORD="..." npm run create:staff
```

Believers register themselves on the live site at `/register`.

## 3. Frontend on Vercel

1. Import the same GitHub repo in Vercel.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Environment variables:

```env
VITE_API_URL=https://peniel-api.onrender.com/api
VITE_CHURCH_NAME=Peniel Evangelical Fellowship
```

4. Deploy.

## 4. Custom domain `penielevangelicalfellowship.org`

### On Vercel (website)

1. Project → **Settings → Domains**
2. Add:
   - `penielevangelicalfellowship.org`
   - `www.penielevangelicalfellowship.org`
3. At your domain registrar, add the DNS records Vercel shows (usually):
   - `A` record `@` → `76.76.21.21`
   - `CNAME` `www` → `cname.vercel-dns.com`

### Optional API subdomain

- Add `api.penielevangelicalfellowship.org` in Render custom domains and point a `CNAME` to your Render service.
- Then set `VITE_API_URL=https://api.penielevangelicalfellowship.org/api`

Update Render `CLIENT_URL` to include your live Vercel URLs.

## 5. Mobile Google Chrome (after deploy)

The site is mobile-responsive and installable as a Progressive Web App (PWA) once it is live on **HTTPS** (Vercel provides this automatically).

### Use in Chrome on Android

1. Deploy frontend to Vercel and backend to Render (steps above).
2. Set `VITE_API_URL` to your **live** Render API (`https://….onrender.com/api`).
3. On your phone, open Chrome and go to your live site, e.g.  
   `https://penielevangelicalfellowship.org`  
   or your Vercel URL `https://your-app.vercel.app`.
4. Optional — install like an app:  
   Chrome menu (⋮) → **Install app** or **Add to Home screen**.
5. The home-screen icon opens Peniel in standalone mode (no browser bar).

### Checklist so mobile Chrome works after deploy

| Item | What to set |
|------|-------------|
| Frontend HTTPS | Vercel (automatic) |
| API HTTPS | Render (automatic) |
| `VITE_API_URL` | Full HTTPS API URL ending in `/api` |
| `CLIENT_URL` on Render | Your exact Vercel / domain URL(s), comma-separated |
| PWA icons | Included (`icon-192.png`, `icon-512.png`) |
| Service worker | Registers in production (`/sw.js`) |

If the site opens but login/gallery fails on phone, almost always `CLIENT_URL` or `VITE_API_URL` is wrong — fix env vars and redeploy.

## 6. Admin / Pastor / Believer

| Portal | URL path | How to get an account |
|--------|----------|------------------------|
| Believer | `/login/believer` | Register at `/register` with a real identity |
| Pastor | `/login/pastor` | Create with `npm run create:staff` (`STAFF_ROLE=pastor`) |
| Admin | `/login/admin` | Create with `npm run create:staff` (`STAFF_ROLE=admin`) |

**Admin** can upload gallery pictures and monitor users, bookings, prayers, and contact messages. No demo passwords are shipped.
## 7. Gallery uploads on Render

Uploaded pictures are saved under `backend/uploads` on the API server. On Render’s free tier the disk is **ephemeral** (files can disappear on redeploy). For production photos that must persist, either:

- Use a **persistent disk** on a paid Render plan, or
- Later switch uploads to cloud storage (Cloudinary / S3).

Until then, re-upload after major redeploys if needed.
