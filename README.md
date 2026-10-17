# Expense Tracker

Responsive web app for recording daily expenses. JWT auth, custom categories, month + category filters, pagination, per-category recap, and a monthly spending chart. UI language switchable between English (default) and Indonesian.

## Stack

- **Frontend**: React 19 + Vite + react-router (port 5173)
- **Backend**: NestJS 11 + TypeORM + mysql2 (port 3200)
- **Database**: MySQL/MariaDB via XAMPP

## Prerequisites

- Node.js 20+ (Node 22 used here)
- XAMPP MySQL running (socket-only at `/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock`)
- Database `expense-tracker` created (see Database Setup)

## Database Setup

If the DB does not exist yet:

```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS \`expense-tracker\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Tables are created automatically by TypeORM when the backend starts (`synchronize: true`). For a regular TCP MySQL setup, edit `backend/.env`: set `DB_HOST` and clear `DB_SOCKET_PATH`.

## Run

Terminal 1 (backend):

```bash
cd backend
npm install
npm run start:dev
```

Terminal 2 (frontend):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Frontend proxy: `/api` forwards to backend on port 3200.

## Pages

- `/login` — sign in / sign up
- `/` — Dashboard: current-month summary, 12-month chart, category recap
- `/expenses` — expenses: add/edit (modal), month + category filters, pagination
- `/categories` — manage custom categories
- `/settings` — profile, change password, delete account

Navigation: tabs in the topbar (desktop), bottom nav (mobile). Logout via the profile avatar menu (top right). The `EN`/`ID` button switches language.

## Backend env

`backend/.env` (already present, copy `.env.example` if needed):

```
PORT=3200
FRONTEND_ORIGIN=http://localhost:5173
DB_SOCKET_PATH=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=expense-tracker
JWT_SECRET=change-me-in-production-please
```

## Endpoints

All except register/login require the header `Authorization: Bearer <token>`.

- `POST /auth/register` — `{ email, password }`
- `POST /auth/login` — `{ email, password }`
- `GET /auth/me` — user profile
- `PATCH /auth/me/password` — `{ currentPassword, newPassword }`
- `DELETE /auth/me` — `{ password }` (delete account + all data)
- `GET /categories`
- `POST /categories` — `{ name }`
- `PATCH /categories/:id` — `{ name }`
- `DELETE /categories/:id` — fails (400) if the category is still used by expenses
- `GET /expenses?page=&limit=&from=&to=&categoryId=` — list + pagination + filters
- `GET /expenses/summary?from=&to=&categoryId=` — total + per-category recap
- `GET /expenses/monthly?year=` — total per month (12 months)
- `POST /expenses` — `{ amount, categoryId, description, date }`
- `PATCH /expenses/:id`
- `DELETE /expenses/:id`

Per-user data isolation: every expense/category query is filtered by `userId` taken from the JWT.

## Test

```bash
cd backend
npm test    # 4 pagination util tests
npm run lint
```

## Production notes

- Set `NODE_ENV=production` → `synchronize` is disabled. Use TypeORM migrations for the schema.
- Replace `JWT_SECRET` with a strong random value.
- Add refresh tokens / password reset if multi-device support is needed.