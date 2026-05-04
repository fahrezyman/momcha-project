/**
 * InfoRow — icon + label + value layout.
 * Dipakai di halaman detail (order, customer) untuk menampilkan field informasi
 * secara konsisten. Terima children sebagai value agar bisa render teks biasa
 * maupun elemen React (badge, link, dll).
 *
 * @param {React.ElementType} icon  - Lucide icon component
 * @param {string}            label - Label teks di atas value
 * @param {React.ReactNode}   children - Isi value
 * @param {string}            [className] - Kelas tambahan untuk wrapper
 */
export function InfoRow({ icon: Icon, label, children, className = "" }) {
  return (
    <div className={`flex items-start gap-2 sm:gap-3 ${className}`}>
      {Icon && (
        <Icon size={16} className="text-momcha-text-light mt-0.5 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-momcha-text-light">{label}</p>
        <div className="text-xs sm:text-sm font-medium text-momcha-text-dark">
          {children}
        </div>
      </div>
    </div>
  );
}
