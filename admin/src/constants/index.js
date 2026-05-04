/**
 * ORDER_STATUS — peta status order ke label Indonesia dan nama warna badge.
 * Warna dipakai sebagai key ke STATUS_BADGE_COLORS untuk class Tailwind.
 */
export const ORDER_STATUS = {
  pending_payment: { label: "Menunggu Pembayaran", color: "yellow" },
  paid:            { label: "Sudah Bayar",         color: "blue"   },
  completed:       { label: "Selesai",             color: "green"  },
  cancelled:       { label: "Dibatalkan",          color: "red"    },
  refunded:        { label: "Direfund",            color: "gray"   },
};

/**
 * PAYMENT_STATUS — peta payment_status ke label Indonesia dan nama warna badge.
 */
export const PAYMENT_STATUS = {
  pending:   { label: "Pending",     color: "yellow" },
  paid:      { label: "Lunas",       color: "green"  },
  cancelled: { label: "Dibatalkan",  color: "red"    },
  expired:   { label: "Expired",     color: "gray"   },
  refunded:  { label: "Direfund",    color: "blue"   },
};

/**
 * STATUS_BADGE_COLORS — class Tailwind per nama warna.
 * Diindeks oleh nilai `color` dari ORDER_STATUS / PAYMENT_STATUS.
 */
export const STATUS_BADGE_COLORS = {
  yellow: "bg-yellow-100 text-yellow-700",
  blue:   "bg-blue-100 text-blue-700",
  green:  "bg-green-100 text-green-700",
  red:    "bg-red-100 text-red-700",
  gray:   "bg-gray-100 text-gray-700",
};

/** Format angka ke mata uang IDR, tanpa desimal. Contoh: 150000 → "Rp 150.000" */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Format Date/string ke tanggal panjang Indonesia. Contoh: "1 Mei 2026" */
export function formatDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/** Ambil HH:MM dari string waktu "HH:MM:SS". Contoh: "09:30:00" → "09:30" */
export function formatTime(time) {
  if (!time) return "-";
  return time.substring(0, 5);
}

/** Format Date/string ke tanggal + jam singkat Indonesia. Contoh: "1 Mei 2026, 09.30" */
export function formatDateTime(datetime) {
  if (!datetime) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(datetime));
}
