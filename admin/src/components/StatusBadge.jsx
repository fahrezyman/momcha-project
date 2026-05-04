import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS, PAYMENT_STATUS, STATUS_BADGE_COLORS } from "@/constants";

/**
 * OrderStatusBadge — badge warna untuk status order (pending_payment, paid, completed, dll).
 *
 * @param {string}  status          - Nilai status order dari API
 * @param {boolean} [bordered=false] - Tambah border pada badge
 */
export function OrderStatusBadge({ status, bordered = false }) {
  const { label, color } = ORDER_STATUS[status] || { label: status, color: "gray" };
  return (
    <Badge className={`${STATUS_BADGE_COLORS[color]} ${bordered ? "border" : "border-0"} text-xs`}>
      {label}
    </Badge>
  );
}

/**
 * PaymentStatusBadge — badge warna untuk status pembayaran (pending, paid, cancelled, dll).
 *
 * @param {string}  status          - Nilai payment_status dari API
 * @param {boolean} [bordered=false] - Tambah border pada badge
 */
export function PaymentStatusBadge({ status, bordered = false }) {
  const { label, color } = PAYMENT_STATUS[status] || { label: status, color: "gray" };
  return (
    <Badge className={`${STATUS_BADGE_COLORS[color]} ${bordered ? "border" : "border-0"} text-xs`}>
      {label}
    </Badge>
  );
}
