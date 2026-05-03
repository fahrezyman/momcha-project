import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS, PAYMENT_STATUS, STATUS_BADGE_COLORS } from "@/constants";

export function OrderStatusBadge({ status, bordered = false }) {
  const { label, color } = ORDER_STATUS[status] || { label: status, color: "gray" };
  return (
    <Badge className={`${STATUS_BADGE_COLORS[color]} ${bordered ? "border" : "border-0"} text-xs`}>
      {label}
    </Badge>
  );
}

export function PaymentStatusBadge({ status, bordered = false }) {
  const { label, color } = PAYMENT_STATUS[status] || { label: status, color: "gray" };
  return (
    <Badge className={`${STATUS_BADGE_COLORS[color]} ${bordered ? "border" : "border-0"} text-xs`}>
      {label}
    </Badge>
  );
}
