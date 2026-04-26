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

| Layer    | Teknologi                                                  |
| -------- | ---------------------------------------------------------- |
| Landing  | HTML, CSS, JavaScript (vanilla)                            |
| Admin    | Next.js 16, React 19, Tailwind CSS, shadcn/ui, Recharts    |
| Backend  | Node.js, Express 5, MySQL2, JWT, Midtrans, Winston         |

## Fitur

### Admin Dashboard
- **Dashboard** — ringkasan statistik pesanan, pendapatan, dan grafik
- **Pesanan** — manajemen pesanan, detail pesanan, cetak invoice PDF
- **Pelanggan** — daftar dan detail data pelanggan
- **Layanan** — manajemen layanan yang ditawarkan
- **Kalender** — jadwal kunjungan dan hari libur nasional
- **Laporan** — laporan pendapatan dengan filter rentang tanggal

### Backend API
- Autentikasi admin dengan JWT
- CRUD pesanan, pelanggan, dan layanan
- Integrasi pembayaran Midtrans
- Rate limiting dan security headers (Helmet)
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

- **Backend** — di-deploy ke VPS/cloud (Node.js server)
- **Admin** — di-deploy ke Vercel
- **Landing** — di-deploy ke hosting statis

## Lisensi

ISC — Ilham Fahrezy
