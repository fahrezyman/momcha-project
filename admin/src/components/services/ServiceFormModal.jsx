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

/** Form fields dipakai bersama oleh create dan edit mode. */
function ServiceFormFields({ formData, onChange }) {
  return (
    <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
      <div className="space-y-1.5">
        <label className="text-xs sm:text-sm font-medium">
          Nama Service <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Contoh: Pijat Laktasi"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          className="h-9 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs sm:text-sm font-medium">Deskripsi</label>
        <textarea
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-momcha-coral"
          rows="3"
          placeholder="Deskripsi singkat service"
          value={formData.description}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-medium">
            Harga <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="150000"
            value={formData.price}
            onChange={(e) => onChange({ ...formData, price: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-medium">
            Durasi (menit) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="60"
            value={formData.duration_minutes}
            onChange={(e) => onChange({ ...formData, duration_minutes: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * ServiceFormModal — dipakai untuk create dan edit service (mode prop).
 *
 * @param {boolean}        open          - Apakah modal terbuka
 * @param {Function}       onClose       - Dipanggil saat modal ditutup
 * @param {Function}       onSave        - Dipanggil saat simpan/update
 * @param {object}         formData      - { name, description, price, duration_minutes }
 * @param {Function}       onFormChange  - (updatedForm) => void
 * @param {boolean}        loading       - true saat API call berjalan
 * @param {'create'|'edit'} mode         - Menentukan title dan label tombol
 */
export function ServiceFormModal({ open, onClose, onSave, formData, onFormChange, loading, mode = "create" }) {
  const isEdit = mode === "edit";
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {isEdit ? "Edit Service" : "Tambah Service Baru"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isEdit ? "Update informasi service" : "Isi form di bawah untuk menambah service"}
          </DialogDescription>
        </DialogHeader>
        <ServiceFormFields formData={formData} onChange={onFormChange} />
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
              isEdit ? "Update" : "Simpan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
