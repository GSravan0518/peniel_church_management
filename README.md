# Peniel Evangelical Fellowship

MERN stack church website for **Peniel Evangelical Fellowship**.

## Stack

- **MongoDB** + Mongoose
- **Express** API
- **React** (Vite) frontend
- **Node.js** backend
- JWT auth for members, pastors, and admins

## Pages

- Home, About, Events, Event Details, Register Event
- Devotionals, Prayer Wall
- Special Occasions (Birthdays, Anniversaries, Thanksgiving)
- Gallery, Contact
- Login, Register
- Member Dashboard, Pastor Dashboard

## Setup

### 1. MongoDB

Make sure MongoDB is running locally (default URI in `backend/.env`):

```
mongodb://127.0.0.1:27017/church_web
```

### 2. Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

## Demo accounts

| Role   | Email                                         | Password   |
|--------|-----------------------------------------------|------------|
| Pastor | pastor@penieleevangelicalfellowship.org       | pastor123  |
| Member | member@penieleevangelicalfellowship.org       | member123  |
| Admin  | admin@penieleevangelicalfellowship.org        | admin123   |

## API overview

- `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me`
- `GET/POST /api/events` · `POST /api/events/:id/register`
- `GET/POST /api/devotions`
- `GET/POST /api/prayers` · `POST /api/prayers/:id/pray`
- `GET/POST /api/occasions`
- `GET/POST /api/gallery`
- `POST /api/contact`
- `GET /api/dashboard/member` · `GET /api/dashboard/pastor`
