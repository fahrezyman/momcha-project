# Momcha Admin Dashboard

Admin dashboard untuk platform Momcha — manajemen pesanan, pelanggan, layanan, dan laporan.

## Tech Stack

- **Framework** — Next.js 16 (App Router), React 19
- **Styling** — Tailwind CSS v4, shadcn/ui, Radix UI
- **Charts** — Recharts
- **Drag & Drop** — @dnd-kit/core, @dnd-kit/sortable
- **Forms** — react-hook-form, Zod
- **PDF** — jsPDF, jspdf-autotable
- **Calendar** — react-day-picker, date-holidays, date-fns
- **Notifications** — Sonner

## Halaman

| Route               | Deskripsi                                      |
| ------------------- | ---------------------------------------------- |
| `/dashboard`        | Statistik ringkasan dan grafik tren            |
| `/orders`           | Daftar pesanan dengan filter status/pembayaran |
| `/orders/[id]`      | Detail pesanan + cetak invoice PDF             |
| `/orders/create`    | Buat pesanan baru                              |
| `/customers`        | Daftar pelanggan + pencarian                   |
| `/customers/[id]`   | Detail pelanggan + riwayat pesanan             |
| `/services`         | Manajemen layanan + drag-and-drop reorder      |
| `/calendar`         | Kalender jadwal kunjungan + hari libur         |
| `/reports`          | Laporan pendapatan per rentang tanggal         |

## Development

```bash
npm install
```

Buat file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm run dev     # http://localhost:3000
npm run build
npm start
```

## Deployment

Di-deploy ke Vercel. Auto-deploy dari branch `main`.
