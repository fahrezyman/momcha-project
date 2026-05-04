import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { formatCurrency } from "@/constants";

/**
 * DeleteServiceModal — konfirmasi hapus service.
 *
 * @param {boolean}  open      - Apakah modal terbuka
 * @param {Function} onClose   - Dipanggil saat modal ditutup
 * @param {Function} onConfirm - Dipanggil saat konfirmasi dikirim
 * @param {object}   service   - Data service yang akan dihapus
 * @param {boolean}  loading   - true saat API call berjalan
 */
export function DeleteServiceModal({ open, onClose, onConfirm, service, loading }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Hapus Service</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Service yang dihapus tidak dapat dikembalikan
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 sm:py-4">
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-red-50 rounded-lg">
            <Trash2 className="text-red-600 shrink-0" size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-red-900 truncate">
                {service?.name}
              </p>
              <p className="text-xs text-red-700">
                {formatCurrency(service?.price)} · {service?.duration_minutes} menit
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-momcha-text-light mt-3 sm:mt-4">
            ⚠️ Pastikan tidak ada order aktif menggunakan service ini
          </p>
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
              <><Loader2 size={14} className="mr-2 animate-spin" />Menghapus...</>
            ) : (
              <><Trash2 size={14} className="mr-2" />Ya, Hapus Service</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
