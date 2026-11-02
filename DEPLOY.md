# Deployment Guide

How to build and deploy the Expense Tracker backend and frontend to the production server.

## Layout

| Purpose              | Local                                       | Server                          |
| -------------------- | ------------------------------------------- | ------------------------------- |
| Source repo          | `~/Documents/workspace/expense-tracker-app` | `~/expense-tracker`             |
| Backend build output | `backend/dist`                              | `~/api-expense-tracker/dist`    |
| Backend env          | `backend/.env`                              | `~/api-expense-tracker/.env`    |
| Backend port         | 3200 (dev)                                  | 3100                            |
| Frontend web root    | —                                           | `/var/www/expense-tracker`      |
| Frontend port (dev)  | 5173                                        | served as static files by nginx |

The deployed backend runs `dist/main.js` from `~/api-expense-tracker` via pm2. The frontend is a static Vite build served from `/var/www/expense-tracker`.

## Prerequisites

- Node.js 20+ (Node 22 used here) and npm.
- On the server: MariaDB, nginx, pm2 already installed and running.
- Local only: XAMPP MySQL runnings

## Backend Build & Deploy

```bash
ssh <alias-name-server>

# 1. Update source
cd ~/expense-tracker && git pull --ff-only

# 2. Build
cd backend && npm install && npm run build

# 3. Deploy dist (keep a timestamped backup of the previous build)
cp -r dist ~/api-expense-tracker/dist

# 4. Restart
pm2 restart expense-api
```

Verify:

```bash
pm2 describe expense-api | grep -E "status|restarts"
ss -ltn | grep 3100
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3100/categories   # expect 401
```

A `401` means the server is up and the auth guard is working. Each new build should restart the process with a stable `restarts` counter (no rapid growth).

## Frontend Build & Deploy

```bash
ssh <alias-name-server>

cd ~/expense-tracker/frontend && npm install && npm run build

# Replace web root contents with the new build
rm -rf /var/www/expense-tracker/* && cp -r dist/. /var/www/expense-tracker/
```

Verify:

```bash
curl -s https://expense.iwon.my.id/ | grep -o "assets/index-[A-Za-z0-9]*\.js"
curl -s -o /dev/null -w "%{http_code}\n" https://expense.iwon.my.id/
```

The `index.html` should reference the newly built asset hash, and the page should return `200`.

## Backend Environment

`~/api-expense-tracker/.env` (values shown are placeholders — never commit real secrets):

```
PORT=3100
NODE_ENV=development
FRONTEND_ORIGIN=https://expense.iwon.my.id
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=<db-password>
DB_DATABASE=expense_tracker
JWT_SECRET=<jwt-secret>
```

Note: when `NODE_ENV` is not `production`, TypeORM runs with `synchronize: true`, so tables are created/updated automatically on startup. Set `NODE_ENV=production` only if you manage the schema with migrations.

## Verification Checklist

- `pm2 describe expense-api` → status `online`, `restarts` not increasing rapidly.
- `ss -ltn | grep 3100` → listening.
- `curl http://127.0.0.1:3100/categories` → `401`.
- `curl https://expense.iwon.my.id/` → `200`, and `index.html` references the latest asset hash.
- Optional: `https://expense.iwon.my.id/api/categories` → `401` (proves the nginx → backend route works).

## Rollback

Backend:

```bash
rm -rf ~/api-expense-tracker/dist
mv ~/api-expense-tracker/dist.bak.<timestamp> ~/api-expense-tracker/dist
pm2 restart expense-api
```

Frontend:

```bash
cd ~/expense-tracker && git checkout <previous-commit>
cd frontend && npm install && npm run build
rm -rf /var/www/expense-tracker/* && cp -r dist/. /var/www/expense-tracker/
```

## Notes

- Do not commit secrets. Keep `.env` files out of git and reference them only by name in documentation.
- The pm2 process currently writes logs to `/dev/null`, so crash output is not persisted. To capture logs, set `out_file`/`error_file` (for example under `~/.pm2/logs/`) via `pm2 set` or an ecosystem file and restart the process.
