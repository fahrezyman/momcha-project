import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Power } from "lucide-react";
import { formatCurrency } from "@/constants";

/**
 * ToggleServiceModal — konfirmasi aktifkan / nonaktifkan service.
 *
 * @param {boolean}  open      - Apakah modal terbuka
 * @param {Function} onClose   - Dipanggil saat modal ditutup
 * @param {Function} onConfirm - Dipanggil saat konfirmasi dikirim
 * @param {object}   service   - Data service yang akan di-toggle
 * @param {boolean}  loading   - true saat API call berjalan
 */
export function ToggleServiceModal({ open, onClose, onConfirm, service, loading }) {
  const isActive = service?.is_active;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {isActive ? "Nonaktifkan" : "Aktifkan"} Service
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isActive
              ? "Service yang dinonaktifkan tidak akan muncul di daftar order baru"
              : "Service akan muncul kembali di daftar order baru"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 sm:py-4">
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-momcha-cream rounded-lg">
            <Power
              className={`shrink-0 ${isActive ? "text-yellow-600" : "text-green-600"}`}
              size={20}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-momcha-text-dark truncate">
                {service?.name}
              </p>
              <p className="text-xs text-momcha-text-light">
                {formatCurrency(service?.price)} · {service?.duration_minutes} menit
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
            className={`text-sm h-9 ${isActive ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
          >
            {loading ? (
              <><Loader2 size={14} className="mr-2 animate-spin" />Memproses...</>
            ) : (
              <><Power size={14} className="mr-2" />{isActive ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
