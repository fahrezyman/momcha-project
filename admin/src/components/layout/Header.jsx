"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Menu, X } from "lucide-react";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/orders": "Orders",
  "/orders/create": "Buat Order Baru",
  "/customers": "Customers",
  "/services": "Layanan",
  "/calendar": "Jadwal",
  "/reports": "Reports",
  "/settings": "Settings",
};

export default function Header({ onToggleSidebar, isSidebarOpen }) {
  const pathname = usePathname();
  const { admin } = useAuth();
  const [today, setToday] = useState("");

  const title = pageTitles[pathname] || "Dashboard";

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date())
    );
  }, []);

  return (
    <header className="bg-white border-b border-momcha-peach px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between shadow-sm">
      {/* Left Side: Hamburger + Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Hamburger Button (Mobile Only) */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-momcha-cream rounded-lg transition-colors shrink-0"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? (
            <X size={24} className="text-momcha-text-dark" />
          ) : (
            <Menu size={24} className="text-momcha-text-dark" />
          )}
        </button>

        {/* Page Title */}
        <div className="min-w-0 flex-1">
          <h2 className="text-base lg:text-lg font-semibold text-momcha-text-dark truncate">
            {title}
          </h2>
          <p className="text-xs text-momcha-text-light capitalize">
            {today}
          </p>
        </div>
      </div>

      {/* Right Side: Admin Info */}
      <div className="flex items-center gap-2 lg:gap-4 shrink-0">
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
