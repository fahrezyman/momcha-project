# Momcha — Layanan Bidan Profesional

Platform manajemen layanan bidan homecare untuk ibu dan bayi di Surabaya. Terdiri dari tiga sub-project: landing page publik, admin dashboard, dan backend API.

## Struktur Project

```
momcha-project/
├── landing/      # Landing page statis (HTML/CSS/JS)
├── admin/        # Admin dashboard (Next.js)
└── backend/      # REST API (Node.js + Express)
```

## Tech Stack

| Layer    | Teknologi                                                                        |
| -------- | -------------------------------------------------------------------------------- |
| Landing  | HTML, CSS, JavaScript (vanilla)                                                  |
| Admin    | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Recharts, @dnd-kit, jsPDF     |
| Backend  | Node.js, Express 5, MySQL2, JWT, bcrypt, Midtrans, Helmet, Winston               |

## Fitur

### Admin Dashboard
- **Dashboard** — ringkasan statistik pesanan, pendapatan, dan grafik tren
- **Pesanan** — manajemen pesanan, filter status & pembayaran, detail pesanan, cetak invoice PDF
- **Pelanggan** — daftar pelanggan, riwayat pesanan, dan statistik per pelanggan
- **Layanan** — manajemen layanan dengan drag-and-drop untuk mengatur urutan tampil
- **Kalender** — jadwal kunjungan bulanan dan hari libur nasional otomatis
- **Laporan** — laporan pendapatan dengan filter rentang tanggal dan ekspor

### Backend API
- Autentikasi admin dengan JWT + bcrypt
- CRUD pesanan, pelanggan, dan layanan
- Reorder layanan dengan `sort_order`
- Integrasi pembayaran Midtrans + webhook handler
- Rate limiting, security headers (Helmet), CORS
- Logging dengan Winston

### Landing Page
- Informasi layanan dan profil bisnis
- Form pemesanan layanan
- Responsive design

## Menjalankan Project

### Prasyarat
- Node.js 18+
- MySQL

### Backend

```bash
cd backend
npm install
```

Buat file `.env.development` (untuk lokal) atau `.env` (untuk produksi):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=momcha
DB_PORT=3306
JWT_SECRET=your_secret
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
```

```bash
npm run dev      # development
npm start        # production
```

Backend berjalan di `http://localhost:5000`.

### Admin Dashboard

```bash
cd admin
npm install
```

Buat file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm run dev      # development (http://localhost:3000)
npm run build    # build produksi
npm start        # jalankan build produksi
```

### Landing Page

Buka `landing/index.html` langsung di browser, atau serve dengan static server:

```bash
npx serve landing
```

## Deployment

- **Backend** — VPS dengan PM2 (`pm2 start src/server.js --name momcha-backend`)
- **Admin** — Vercel (auto-deploy dari branch `main`)
- **Landing** — hosting statis

## Lisensi

ISC — Ilham Fahrezy
