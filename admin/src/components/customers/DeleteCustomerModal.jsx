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

/**
 * DeleteCustomerModal — konfirmasi hapus customer.
 *
 * @param {boolean}  open      - Apakah modal terbuka
 * @param {Function} onClose   - Dipanggil saat modal ditutup
 * @param {Function} onConfirm - Dipanggil saat konfirmasi dikirim
 * @param {object}   customer  - Data customer yang akan dihapus
 * @param {boolean}  loading   - true saat API call berjalan
 */
export function DeleteCustomerModal({ open, onClose, onConfirm, customer, loading }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Hapus Customer</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Customer yang dihapus tidak dapat dikembalikan
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 sm:py-4">
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-red-50 rounded-lg">
            <Trash2 className="text-red-600 shrink-0" size={20} />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-red-900 truncate">
                {customer?.name}
              </p>
              <p className="text-xs text-red-700">{customer?.phone}</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-momcha-text-light mt-3 sm:mt-4">
            ⚠️ Customer yang memiliki order aktif tidak bisa dihapus
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
              <><Trash2 size={14} className="mr-2" />Ya, Hapus</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
