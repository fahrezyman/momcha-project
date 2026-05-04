import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, User, DollarSign, Scissors } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatTime } from "@/constants";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  expired: "bg-gray-100 text-gray-800 border-gray-200",
};

const STATUS_LABELS = {
  paid: "Lunas",
  pending: "Pending",
  cancelled: "Cancelled",
};

/**
 * CalendarOrderDetailModal — popup detail order dari kalender.
 * Dirender di calendar/page.jsx; menggunakan InfoRow-style layout.
 *
 * @param {boolean}  open    - Apakah modal terbuka
 * @param {Function} onClose - Dipanggil saat modal ditutup
 * @param {object}   order   - Data order yang dipilih
 */
export function CalendarOrderDetailModal({ open, onClose, order }) {
  const statusColor = STATUS_COLORS[order?.payment_status] || STATUS_COLORS.expired;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">{order?.order_number}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Detail order</DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4 max-h-[70vh] overflow-y-auto">
            {/* Date card */}
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-momcha-cream rounded-lg">
              <Calendar className="text-momcha-coral shrink-0" size={20} />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-momcha-text-dark">
                  {format(parseISO(order.service_date), "EEEE, d MMMM yyyy", { locale: id })}
                </p>
                <p className="text-xs text-momcha-text-light">
                  {formatTime(order.service_start_time)} ({order.service_duration_minutes} menit)
                </p>
              </div>
            </div>

            {/* Detail rows */}
            <div className="space-y-3">
              {[
                { icon: User, label: "Customer", value: order.customer_name },
                {
                  icon: Scissors,
                  label: "Layanan",
                  value: order.services_names || "-",
                  sub: order.services_count > 1 ? `${order.services_count} layanan` : null,
                },
                { icon: Clock, label: "Durasi", value: `${order.total_duration_minutes} menit` },
              ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon size={16} className="text-momcha-text-light shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-momcha-text-light mb-0.5">{label}</p>
                    <p className="text-xs sm:text-sm text-momcha-text-dark">{value}</p>
                    {sub && <p className="text-xs text-momcha-text-light mt-0.5">{sub}</p>}
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-2">
                <DollarSign size={16} className="text-momcha-text-light shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-momcha-text-light mb-0.5">Total</p>
                  <p className="text-sm sm:text-base font-bold text-momcha-coral">
                    {formatCurrency(order.total_amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-momcha-peach">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-momcha-text-light mb-1.5">Status Pembayaran</p>
                  <Badge className={`${statusColor} text-xs`}>
                    {STATUS_LABELS[order.payment_status] ?? order.payment_status}
                  </Badge>
                </div>
              </div>
            </div>

            <Link href={`/orders/${order.id}`} className="block pt-2">
              <Button className="w-full bg-momcha-coral hover:bg-momcha-brown text-sm h-10">
                Lihat Detail Order
              </Button>
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
