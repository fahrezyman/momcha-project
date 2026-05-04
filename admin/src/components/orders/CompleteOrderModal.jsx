import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Loader2 } from "lucide-react";
import { formatDate, formatTime } from "@/constants";

/**
 * CompleteOrderModal — konfirmasi tandai order selesai.
 * Memaksa admin mencentang checkbox sebelum tombol aktif
 * agar tidak klik tidak sengaja.
 *
 * @param {boolean}  open             - Apakah modal terbuka
 * @param {Function} onClose          - Dipanggil saat modal ditutup
 * @param {Function} onConfirm        - Dipanggil saat konfirmasi dikirim
 * @param {object}   order            - Data order
 * @param {boolean}  loading          - true saat API call sedang berjalan
 * @param {boolean}  confirmed        - State checkbox konfirmasi
 * @param {Function} onConfirmedChange - (value: boolean) => void
 */
export function CompleteOrderModal({ open, onClose, onConfirm, order, loading, confirmed, onConfirmedChange }) {
  function handleClose() {
    onConfirmedChange(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Tandai Selesai</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Order ini akan ditandai sebagai selesai
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 sm:py-4">
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
            <Check className="text-blue-600 shrink-0" size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-blue-900 truncate">
                {order?.order_number}
              </p>
              <p className="text-xs text-blue-700">{order?.services?.length} layanan</p>
              <p className="text-xs text-blue-700">
                {formatDate(order?.service_date)} · {formatTime(order?.service_start_time)}
              </p>
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => onConfirmedChange(e.target.checked)}
              className="mt-0.5 rounded"
            />
            <span className="text-xs sm:text-sm text-momcha-text-dark">
              Saya konfirmasi bahwa semua layanan sudah selesai dikerjakan
            </span>
          </label>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={loading} className="text-sm h-9">
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!confirmed || loading}
            className="bg-momcha-coral hover:bg-momcha-brown text-sm h-9"
          >
            {loading ? (
              <><Loader2 size={14} className="mr-2 animate-spin" />Memproses...</>
            ) : (
              <><Check size={14} className="mr-2" />Ya, Tandai Selesai</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
