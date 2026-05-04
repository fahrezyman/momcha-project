import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
 * EditCustomerModal — form edit data customer.
 *
 * @param {boolean}  open          - Apakah modal terbuka
 * @param {Function} onClose       - Dipanggil saat modal ditutup
 * @param {Function} onSave        - Dipanggil saat tombol Update diklik
 * @param {object}   formData      - { name, phone, email, address }
 * @param {Function} onFormChange  - (updatedForm) => void
 * @param {boolean}  loading       - true saat API call berjalan
 */
export function EditCustomerModal({ open, onClose, onSave, formData, onFormChange, loading }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Edit Customer</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Update informasi customer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2 sm:py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium">
              Nama <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nama customer"
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              className="text-sm h-10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium">
              Nomor HP <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              placeholder="08123456789"
              value={formData.phone}
              onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
              className="text-sm h-10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
              className="text-sm h-10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium">Alamat</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-momcha-coral"
              rows="3"
              placeholder="Alamat lengkap"
              value={formData.address}
              onChange={(e) => onFormChange({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading} className="text-sm h-9">
            Batal
          </Button>
          <Button
            onClick={onSave}
            disabled={loading}
            className="bg-momcha-coral hover:bg-momcha-brown text-sm h-9"
          >
            {loading ? (
              <><Loader2 size={14} className="mr-2 animate-spin" />Menyimpan...</>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
