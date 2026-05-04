import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

/**
 * CancelOrderModal — form pembatalan order dengan alasan wajib.
 * Jika order sudah lunas, kolom keterangan refund juga wajib diisi.
 *
 * @param {boolean}  open              - Apakah modal terbuka
 * @param {Function} onClose           - Dipanggil saat modal ditutup
 * @param {Function} onConfirm         - Dipanggil saat konfirmasi dikirim
 * @param {object}   order             - Data order (butuh payment_status)
 * @param {boolean}  loading           - true saat API call sedang berjalan
 * @param {string}   reason            - Nilai textarea alasan pembatalan
 * @param {Function} onReasonChange    - (value: string) => void
 * @param {string}   refundNotes       - Nilai textarea keterangan refund
 * @param {Function} onRefundNotesChange - (value: string) => void
 */
export function CancelOrderModal({
  open,
  onClose,
  onConfirm,
  order,
  loading,
  reason,
  onReasonChange,
  refundNotes,
  onRefundNotesChange,
}) {
  const textareaClass =
    "w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-momcha-coral";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Cancel Order</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Order yang dibatalkan tidak dapat dikembalikan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium">
              Alasan Pembatalan <span className="text-red-500">*</span>
            </label>
            <textarea
              className={textareaClass}
              rows="3"
              placeholder="Contoh: Customer request cancel, double booking, dll"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
            />
          </div>

          {/* Refund notes — hanya muncul kalau order sudah dibayar */}
          {order?.payment_status === "paid" && (
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium">
                Keterangan Refund <span className="text-red-500">*</span>
              </label>
              <textarea
                className={textareaClass}
                rows="2"
                placeholder="Contoh: Sudah transfer balik Rp 150.000 ke rekening BCA customer"
                value={refundNotes}
                onChange={(e) => onRefundNotesChange(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading} className="text-sm h-9">
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white text-sm h-9"
          >
            {loading ? (
              <><Loader2 size={14} className="mr-2 animate-spin" />Memproses...</>
            ) : (
              "Cancel Order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
