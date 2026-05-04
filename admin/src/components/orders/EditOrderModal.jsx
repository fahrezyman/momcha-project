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
import { Loader2, Plus } from "lucide-react";
import { ServicePickerRow } from "@/components/orders/ServicePickerRow";

/** Mengembalikan tanggal hari ini dalam format YYYY-MM-DD (timezone lokal). */
function todayString() {
  return new Date().toLocaleDateString("en-CA");
}

/**
 * EditOrderModal — form edit layanan, jadwal, dan catatan order.
 *
 * Perubahan layanan dan reschedule dipisah: backend memiliki dua endpoint
 * (PUT /orders/:id dan POST /orders/:id/reschedule) karena reschedule
 * menghasilkan history dan validasi jadwal bentrok.
 *
 * @param {boolean}  open          - Apakah modal terbuka
 * @param {Function} onClose       - Dipanggil saat modal ditutup
 * @param {Function} onSave        - Dipanggil saat simpan; menerima editForm terkini
 * @param {object}   editForm      - { services, service_date, service_start_time, notes }
 * @param {Function} onEditFormChange - (updatedForm) => void
 * @param {Array}    services      - Daftar layanan aktif dari API
 * @param {boolean}  loadingServices - true saat layanan sedang dimuat
 * @param {boolean}  loading       - true saat API call sedang berjalan
 */
export function EditOrderModal({
  open,
  onClose,
  onSave,
  editForm,
  onEditFormChange,
  services,
  loadingServices,
  loading,
}) {
  /** Update satu field pada baris layanan di index tertentu. */
  function updateServiceItem(index, field, value) {
    const updated = [...editForm.services];
    updated[index] = { ...updated[index], [field]: value };
    onEditFormChange({ ...editForm, services: updated });
  }

  /** Hapus baris layanan. Minimal harus ada 1. */
  function removeServiceItem(index) {
    if (editForm.services.length === 1) return;
    onEditFormChange({
      ...editForm,
      services: editForm.services.filter((_, i) => i !== index),
    });
  }

  /** Tambah baris layanan kosong. */
  function addServiceItem() {
    onEditFormChange({
      ...editForm,
      services: [
        ...editForm.services,
        { service_id: "", quantity: 1, use_custom_price: false, custom_price: "" },
      ],
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Edit Order</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Ubah layanan, tanggal, atau waktu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
          {/* Services */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium">Layanan</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addServiceItem}
                className="h-8 text-xs"
              >
                <Plus size={12} className="mr-1" />
                Tambah
              </Button>
            </div>

            {loadingServices ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin text-momcha-coral" />
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {editForm.services?.map((item, index) => (
                  <ServicePickerRow
                    key={index}
                    item={item}
                    index={index}
                    services={services}
                    onChange={(field, value) => updateServiceItem(index, field, value)}
                    onRemove={() => removeServiceItem(index)}
                    canRemove={editForm.services.length > 1}
                    size="sm"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={editForm.service_date}
              onChange={(e) => onEditFormChange({ ...editForm, service_date: e.target.value })}
              min={todayString()}
              className="h-9 sm:h-10 text-sm"
            />
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium">
              Waktu <span className="text-red-500">*</span>
            </label>
            <Input
              type="time"
              value={editForm.service_start_time}
              onChange={(e) => onEditFormChange({ ...editForm, service_start_time: e.target.value })}
              className="h-9 sm:h-10 text-sm"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium">Catatan</label>
            <textarea
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-momcha-coral"
              rows="2"
              placeholder="Catatan tambahan (opsional)"
              value={editForm.notes}
              onChange={(e) => onEditFormChange({ ...editForm, notes: e.target.value })}
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
              "Simpan Perubahan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
