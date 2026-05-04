import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/constants";

/**
 * ServicePickerRow — satu baris pemilihan layanan di form order.
 * Dipakai di dua tempat:
 *  - orders/create/page.jsx (buat order baru)
 *  - orders/[id]/EditOrderModal.jsx (edit order existing)
 *
 * @param {object}   item              - { service_id, quantity, use_custom_price, custom_price }
 * @param {number}   index             - Index baris dalam array services
 * @param {Array}    services          - Daftar layanan aktif dari API
 * @param {Function} onChange          - (field, value) => void — update field pada item ini
 * @param {Function} onRemove          - () => void — hapus baris ini
 * @param {boolean}  canRemove         - false jika ini satu-satunya baris (minimal 1)
 * @param {'sm'|'md'} [size='md']      - Ukuran input; 'sm' untuk modal, 'md' untuk halaman penuh
 */
export function ServicePickerRow({ item, index, services, onChange, onRemove, canRemove, size = "md" }) {
  const inputClass = size === "sm" ? "h-8 text-xs sm:text-sm" : "text-sm";
  const selectClass = size === "sm"
    ? "w-full px-2 sm:px-3 py-1.5 border rounded-lg text-xs sm:text-sm"
    : "w-full px-3 py-2 border border-momcha-peach rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-momcha-coral";

  const selectedService = item.service_id
    ? services.find((s) => s.id === parseInt(item.service_id))
    : null;

  const subtotal = selectedService
    ? (item.use_custom_price && item.custom_price
        ? parseFloat(item.custom_price)
        : selectedService.price) * item.quantity
    : 0;

  return (
    <div className="space-y-2 pb-3 border-b border-momcha-peach last:border-0">
      {/* Service select + qty + remove */}
      <div className="flex gap-2 items-start">
        <select
          className={`flex-1 ${selectClass}`}
          value={item.service_id}
          onChange={(e) => onChange("service_id", e.target.value)}
          required
        >
          <option value="">-- Pilih Layanan --</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} — {formatCurrency(service.price)}
              {size === "md" ? ` (${service.duration_minutes}m)` : ""}
            </option>
          ))}
        </select>

        <Input
          type="number"
          min="1"
          placeholder="Qty"
          value={item.quantity}
          onChange={(e) => onChange("quantity", e.target.value)}
          className={`w-16 ${inputClass}`}
          required
        />

        {/* Subtotal — hanya tampil di ukuran md dan kalau tidak pakai custom price */}
        {size === "md" && selectedService && !item.use_custom_price && (
          <div className="w-32 flex items-center text-sm font-medium text-momcha-text-dark">
            {formatCurrency(subtotal)}
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={!canRemove}
          className={`text-red-600 hover:bg-red-50 p-0 ${size === "sm" ? "h-8 w-8" : "h-10 w-10"}`}
        >
          <Trash2 size={size === "sm" ? 14 : 16} />
        </Button>
      </div>

      {/* Custom price toggle */}
      {item.service_id && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={item.use_custom_price || false}
              onChange={(e) => {
                onChange("use_custom_price", e.target.checked);
                if (!e.target.checked) onChange("custom_price", "");
              }}
              className="rounded border-momcha-peach"
            />
            <span className="text-momcha-text-light">Custom harga</span>
          </label>

          {item.use_custom_price && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                placeholder="Harga custom"
                value={item.custom_price || ""}
                onChange={(e) => onChange("custom_price", e.target.value)}
                className={`w-36 ${inputClass}`}
                required
              />
              {size === "md" && (
                <span className="text-sm font-medium text-momcha-coral">
                  = {formatCurrency((parseFloat(item.custom_price) || 0) * item.quantity)}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
