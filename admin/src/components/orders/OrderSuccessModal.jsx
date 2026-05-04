import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { formatCurrency } from "@/constants";

/**
 * OrderSuccessModal — ditampilkan setelah order baru berhasil dibuat.
 * Payment link sudah disalin ke clipboard secara otomatis sebelum modal ini dibuka.
 *
 * @param {boolean}  open          - Apakah modal terbuka
 * @param {Function} onClose       - Dipanggil saat modal ditutup (kembali ke list)
 * @param {Function} onViewDetail  - Dipanggil saat tombol "Lihat Detail" diklik
 * @param {object}   order         - Data order yang baru dibuat
 */
export function OrderSuccessModal({ open, onClose, onViewDetail, order }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Check size={24} />
            Order Berhasil Dibuat!
          </DialogTitle>
          <DialogDescription>
            Order telah dibuat dan payment link sudah disalin
          </DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-momcha-cream rounded-lg">
              <p className="text-xs text-momcha-text-light mb-1">Order Number</p>
              <p className="text-lg font-bold text-momcha-text-dark">{order.order_number}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(order.total_amount)}
              </p>
            </div>
            {order.payment_link && (
              <div className="space-y-2">
                <p className="text-xs text-momcha-text-light">Payment Link (sudah disalin)</p>
                <div className="p-3 bg-gray-100 rounded text-xs break-all">
                  {order.payment_link}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Tutup
          </Button>
          <Button
            onClick={onViewDetail}
            className="flex-1 bg-momcha-coral hover:bg-momcha-brown"
          >
            Lihat Detail
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
