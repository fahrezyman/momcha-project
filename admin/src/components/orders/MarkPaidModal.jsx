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
import { formatCurrency } from "@/constants";

/**
 * MarkPaidModal — konfirmasi tandai order sudah dibayar secara manual.
 *
 * @param {boolean}  open      - Apakah modal terbuka
 * @param {Function} onClose   - Dipanggil saat modal ditutup
 * @param {Function} onConfirm - Dipanggil saat konfirmasi dikirim
 * @param {object}   order     - Data order
 * @param {boolean}  loading   - true saat API call sedang berjalan
 */
export function MarkPaidModal({ open, onClose, onConfirm, order, loading }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Konfirmasi Pembayaran</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Tandai order ini sebagai sudah dibayar?
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 sm:py-4">
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-green-50 rounded-lg">
            <Check className="text-green-600 shrink-0" size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-green-900 truncate">
                {order?.order_number}
              </p>
              <p className="text-xs sm:text-sm text-green-700">
                {formatCurrency(order?.total_amount)}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading} className="text-sm h-9">
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white text-sm h-9"
          >
            {loading ? (
              <><Loader2 size={14} className="mr-2 animate-spin" />Memproses...</>
            ) : (
              <><Check size={14} className="mr-2" />Ya, Tandai Sudah Bayar</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
