"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Bell } from "lucide-react";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/dashboard/orders": "Orders",
  "/dashboard/orders/create": "Buat Order Baru",
  "/dashboard/customers": "Customers",
  "/dashboard/services": "Layanan",
  "/dashboard/calendar": "Jadwal",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

export default function Header() {
  const pathname = usePathname();
  const { admin } = useAuth();

  const title = pageTitles[pathname] || "Dashboard";

  // Get today's date
  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="bg-white border-b border-momcha-peach px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Page Title */}
      <div>
        <h2 className="text-lg font-semibold text-momcha-text-dark">{title}</h2>
        <p className="text-xs text-momcha-text-light capitalize">{today}</p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Admin Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-momcha-coral flex items-center justify-center text-white text-sm font-bold">
            {admin?.name?.charAt(0) || "A"}
          </div>
          <span className="text-sm font-medium text-momcha-text-dark hidden md:block">
            {admin?.name || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
