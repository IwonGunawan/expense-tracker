# Expense Tracker

Aplikasi web responsive untuk catat pengeluaran harian. Auth JWT, kategori custom, filter bulan + kategori, pagination, rekap per kategori, dan chart pengeluaran per bulan.

## Stack

- **Frontend**: React 19 + Vite + react-router (port 5173)
- **Backend**: NestJS 11 + TypeORM + mysql2 (port 3200)
- **Database**: MySQL/MariaDB via XAMPP

## Prasyarat

- Node.js 20+ (sudah dipakai Node 22 di sini)
- XAMPP MySQL jalan (socket-only di `/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock`)
- Database `expense-tracker` sudah dibuat (lihat bagian Setup DB)

## Setup database

Kalau DB belum ada:

```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS \`expense-tracker\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Tabel dibuat otomatis oleh TypeORM saat backend jalan (`synchronize: true`). Kalau pakai MySQL TCP biasa, ubah `backend/.env`: isi `DB_HOST`, kosongkan `DB_SOCKET_PATH`.

## Jalankan

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

Buka http://localhost:5173. Dependency frontend/backend: frontend proxy `/api` ke backend port 3200.

## Halaman

- `/login` — login / daftar
- `/` — Dashboard: ringkasan bulan ini, chart per bulan (1 tahun), rekap kategori
- `/expenses` — pengeluaran: tambah/edit (modal), filter bulan+kategori, pagination
- `/categories` — kelola kategori custom
- `/settings` — profil, ganti password, hapus akun

Navigasi: tabs di topbar (desktop), bottom nav (mobile). Logout di menu icon profil (kanan atas).

## Backend env

`backend/.env` (sudah ada, salin `.env.example` kalau perlu):

```
PORT=3200
FRONTEND_ORIGIN=http://localhost:5173
DB_SOCKET_PATH=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=expense-tracker
JWT_SECRET=change-me-in-production-please
```

## Endpoint

Semua (kecuali register/login) butuh header `Authorization: Bearer <token>`.

- `POST /auth/register` — `{ email, password }`
- `POST /auth/login` — `{ email, password }`
- `GET /auth/me` — profil user
- `PATCH /auth/me/password` — `{ currentPassword, newPassword }`
- `DELETE /auth/me` — `{ password }` (hapus akun + semua data)
- `GET /categories`
- `POST /categories` — `{ name }`
- `PATCH /categories/:id` — `{ name }`
- `DELETE /categories/:id` — gagal (400) kalau kategori masih dipakai expense
- `GET /expenses?page=&limit=&from=&to=&categoryId=` — list + pagination + filter
- `GET /expenses/summary?from=&to=&categoryId=` — total + rekap per kategori
- `GET /expenses/monthly?year=` — total per bulan (12 bulan)
- `POST /expenses` — `{ amount, categoryId, description, date }`
- `PATCH /expenses/:id`
- `DELETE /expenses/:id`

Data tiap user terisolasi: semua query expense/category difilter `userId` dari JWT.

## Test

```bash
cd backend
npm test    # 4 test pagination util
npm run lint
```

## Catatan produksi

- Set `NODE_ENV=production` → `synchronize` mati. Pakai migration TypeORM untuk schema.
- Ganti `JWT_SECRET` dengan nilai acak yang kuat.
- Tambahkan refresh token / reset password kalau butuh multi-device.