import { Input } from "@/components/ui/input";
import { Loader2, User } from "lucide-react";

/**
 * CustomerSearchInput — autocomplete search untuk nama customer.
 * Menampilkan dropdown sugesti dari customer yang sudah terdaftar.
 * Debounce dilakukan di hook (useCreateOrder), bukan di sini.
 *
 * @param {string}   value            - Nilai input saat ini
 * @param {Function} onChange         - (value: string) => void
 * @param {Function} onFocus          - Dipanggil saat input difokus
 * @param {Array}    suggestions      - Daftar customer hasil pencarian
 * @param {boolean}  showSuggestions  - Apakah dropdown ditampilkan
 * @param {Function} onSelect         - (customer) => void
 * @param {boolean}  searching        - true saat debounced search berjalan
 * @param {object}   suggestionsRef   - ref untuk deteksi klik di luar
 */
export function CustomerSearchInput({
  value,
  onChange,
  onFocus,
  suggestions,
  showSuggestions,
  onSelect,
  searching,
  suggestionsRef,
}) {
  return (
    <div className="relative" ref={suggestionsRef}>
      <Input
        placeholder="Ketik nama atau cari customer lama..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        autoComplete="off"
        required
      />
      {searching && (
        <Loader2
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-momcha-text-light"
        />
      )}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-momcha-peach rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => onSelect(customer)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-momcha-cream text-left transition-colors border-b border-momcha-peach last:border-0"
            >
              <div className="w-8 h-8 rounded-full bg-momcha-peach flex items-center justify-center shrink-0">
                <User size={14} className="text-momcha-brown" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-momcha-text-dark truncate">
                  {customer.name}
                </p>
                <p className="text-xs text-momcha-text-light">{customer.phone}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
