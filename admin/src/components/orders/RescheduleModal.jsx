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

function todayString() {
  return new Date().toLocaleDateString("en-CA");
}

/**
 * RescheduleModal — ubah jadwal order yang sudah lunas.
 * Hanya menampilkan field tanggal dan waktu (layanan tidak dapat diubah).
 */
export function RescheduleModal({ open, onClose, onSave, form, onFormChange, loading }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Ubah Jadwal</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Order sudah lunas — hanya tanggal dan waktu yang dapat diubah
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={form.service_date}
              onChange={(e) => onFormChange({ ...form, service_date: e.target.value })}
              min={todayString()}
              className="h-9 sm:h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium">
              Waktu <span className="text-red-500">*</span>
            </label>
            <Input
              type="time"
              value={form.service_start_time}
              onChange={(e) => onFormChange({ ...form, service_start_time: e.target.value })}
              className="h-9 sm:h-10 text-sm"
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
              "Simpan Jadwal"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
