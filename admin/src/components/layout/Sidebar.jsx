"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Scissors,
  Calendar,
  BarChart2,
  LogOut,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Services", href: "/services", icon: Scissors },
  { label: "Jadwal", href: "/calendar", icon: Calendar },
  { label: "Reports", href: "/reports", icon: BarChart2 },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static
          top-0 left-0 h-screen
          w-64 bg-white border-r border-momcha-peach
          flex flex-col shadow-sm
          transition-transform duration-300 ease-in-out
          z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-momcha-peach">
          <div className="flex items-center gap-3">
            <Image
              src="/logo_transparent.png"
              alt="Momcha Logo"
              width={75}
              height={75}
              className="object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <h1 className="text-xl font-bold text-momcha-coral mt-2">
            Momcha Admin
          </h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-momcha-coral text-white shadow-sm"
                      : "text-momcha-text-light hover:bg-momcha-cream hover:text-momcha-text-dark"
                  }
                `}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin Info + Logout */}
        <div className="p-4 border-t border-momcha-peach">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-momcha-coral flex items-center justify-center text-white text-xs font-bold">
              {admin?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-momcha-text-dark truncate">
                {admin?.name || "Admin"}
              </p>
              <p className="text-xs text-momcha-text-light truncate">
                {admin?.username || ""}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}