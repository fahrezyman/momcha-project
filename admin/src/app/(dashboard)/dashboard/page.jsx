"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { formatCurrency, formatDate, formatTime } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageSkeleton } from "@/components/skeletons";
import { ShoppingBag, DollarSign, Clock, TrendingUp, Calendar, User } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { loading, summary, todaySchedule, recentOrders } = useDashboard();

  if (loading) return <DashboardPageSkeleton />;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-momcha-text-dark mb-1">
          Selamat Datang! 👋
        </h1>
        <p className="text-sm text-momcha-text-light">Ringkasan aktivitas hari ini</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: "Orders Hari Ini", value: summary.todayOrders, icon: ShoppingBag, iconClass: "text-momcha-coral", sub: "Total order hari ini" },
          { label: "Pemasukan Hari Ini", value: formatCurrency(summary.todayRevenue), icon: DollarSign, iconClass: "text-momcha-pink", sub: "Dari order yang sudah bayar" },
          { label: "Orders Bulan Ini", value: summary.monthOrders, icon: TrendingUp, iconClass: "text-momcha-brown", sub: "Total order bulan ini" },
          { label: "Pemasukan Bulan Ini", value: formatCurrency(summary.monthRevenue), icon: DollarSign, iconClass: "text-green-500", sub: "Total pemasukan bulan ini" },
        ].map(({ label, value, icon: Icon, iconClass, sub }) => (
          <Card key={label} className="border-momcha-peach">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs lg:text-sm font-medium text-momcha-text-light">
                {label}
              </CardTitle>
              <Icon className={iconClass} size={18} />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-momcha-text-dark">{value}</div>
              <p className="text-xs text-momcha-text-light mt-1 hidden sm:block">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Today's schedule */}
        <Card className="border-momcha-peach">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base lg:text-lg text-momcha-text-dark flex items-center gap-2">
                <Calendar size={18} className="text-momcha-coral" />
                Jadwal Hari Ini
              </CardTitle>
              <Link href="/calendar" className="text-xs text-momcha-coral hover:underline">
                Lihat Semua
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8 text-momcha-text-light">
                <Calendar size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Tidak ada jadwal hari ini</p>
              </div>
            ) : (
              <div className="space-y-2 lg:space-y-3">
                {todaySchedule.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-start gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg bg-momcha-cream hover:bg-momcha-peach transition-colors"
                  >
                    <div className="shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-momcha-coral flex flex-col items-center justify-center text-white">
                      <span className="text-xs font-medium">
                        {formatTime(order.service_start_time)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs lg:text-sm font-medium text-momcha-text-dark truncate">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-momcha-text-light truncate">
                        {order.services_names || "-"}
                      </p>
                      <p className="text-xs font-medium text-momcha-coral mt-0.5 lg:mt-1">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
                        order.payment_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.payment_status === "paid" ? "Lunas" : "Pending"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card className="border-momcha-peach">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base lg:text-lg text-momcha-text-dark flex items-center gap-2">
                <Clock size={18} className="text-momcha-pink" />
                Order Terbaru
              </CardTitle>
              <Link href="/orders" className="text-xs text-momcha-coral hover:underline">
                Lihat Semua
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-momcha-text-light">
                <ShoppingBag size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada order</p>
              </div>
            ) : (
              <div className="space-y-2 lg:space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-start gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg hover:bg-momcha-cream transition-colors"
                  >
                    <div className="shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-momcha-peach flex items-center justify-center">
                      <User size={16} className="text-momcha-brown" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs lg:text-sm font-medium text-momcha-text-dark truncate">
                            {order.order_number}
                          </p>
                          <p className="text-xs text-momcha-text-light truncate">
                            {order.customer_name}
                          </p>
                        </div>
                        <p className="text-xs font-medium text-momcha-coral shrink-0">
                          {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                      <p className="text-xs text-momcha-text-light mt-0.5 lg:mt-1">
                        {formatDate(order.service_date)} · {formatTime(order.service_start_time)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
