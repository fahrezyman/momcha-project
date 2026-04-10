export const ORDER_STATUS = {
  pending_payment: { label: "Menunggu Pembayaran", color: "yellow" },
  paid: { label: "Sudah Bayar", color: "blue" },
  completed: { label: "Selesai", color: "green" },
  cancelled: { label: "Dibatalkan", color: "red" },
  refunded: { label: "Direfund", color: "gray" },
};

export const PAYMENT_STATUS = {
  pending: { label: "Pending", color: "yellow" },
  paid: { label: "Lunas", color: "green" },
  cancelled: { label: "Dibatalkan", color: "red" },
  expired: { label: "Expired", color: "gray" },
  refunded: { label: "Direfund", color: "blue" },
};

export function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(time) {
  if (!time) return "-";
  return time.substring(0, 5); // HH:MM
}

// Color classes for status badges, keyed by color name in ORDER_STATUS / PAYMENT_STATUS
export const STATUS_BADGE_COLORS = {
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-700",
};

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
