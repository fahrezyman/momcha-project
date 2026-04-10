"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, formatTime } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  DollarSign,
  Clock,
  TrendingUp,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    monthOrders: 0,
    monthRevenue: 0,
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const now = new Date();
      const today = now.toISOString().split("T")[0];

      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDay = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      const lastDay = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDayOfMonth).padStart(2, "0")}`;

      const ordersRes = await api.getOrders(
        `?date_from=${firstDay}&date_to=${lastDay}`,
      );

      if (ordersRes.success) {
        const orders = ordersRes.data;

        // ✅ FIX: Use Date object comparison to handle all date formats
        const todayDate = new Date(today);
        const todayOrders = orders.filter((o) => {
          if (!o.service_date) return false;
          const orderDate = new Date(o.service_date);
          return (
            orderDate.getFullYear() === todayDate.getFullYear() &&
            orderDate.getMonth() === todayDate.getMonth() &&
            orderDate.getDate() === todayDate.getDate()
          );
        });

        const todayRevenue = todayOrders
          .filter((o) => o.payment_status === "paid")
          .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

        const monthOrders = orders.length;
        const monthRevenue = orders
          .filter((o) => o.payment_status === "paid")
          .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

        setSummary({
          todayOrders: todayOrders.length,
          todayRevenue,
          monthOrders,
          monthRevenue,
        });

        setTodaySchedule(
          todayOrders
            .filter((o) => o.status !== "completed" && o.status !== "cancelled")
            .sort((a, b) =>
              a.service_start_time.localeCompare(b.service_start_time),
            ),
        );

        setRecentOrders(
          [...orders]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5),
        );
      }
    } catch (error) {
      console.error("Load dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-momcha-coral" />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome - Responsive */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-momcha-text-dark mb-1">
          Selamat Datang! 👋
        </h1>
        <p className="text-sm text-momcha-text-light">
          Ringkasan aktivitas hari ini
        </p>
      </div>

      {/* Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Today Orders */}
        <Card className="border-momcha-peach">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs lg:text-sm font-medium text-momcha-text-light">
              Orders Hari Ini
            </CardTitle>
            <ShoppingBag className="text-momcha-coral" size={18} />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-momcha-text-dark">
              {summary.todayOrders}
            </div>
            <p className="text-xs text-momcha-text-light mt-1 hidden sm:block">
              Total order hari ini
            </p>
          </CardContent>
        </Card>

        {/* Today Revenue */}
        <Card className="border-momcha-peach">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs lg:text-sm font-medium text-momcha-text-light">
              Pemasukan Hari Ini
            </CardTitle>
            <DollarSign className="text-momcha-pink" size={18} />
          </CardHeader>
          <CardContent>
            <div className="text-lg lg:text-2xl font-bold text-momcha-text-dark">
              {formatCurrency(summary.todayRevenue)}
            </div>
            <p className="text-xs text-momcha-text-light mt-1 hidden sm:block">
              Dari order yang sudah bayar
            </p>
          </CardContent>
        </Card>

        {/* Month Orders */}
        <Card className="border-momcha-peach">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs lg:text-sm font-medium text-momcha-text-light">
              Orders Bulan Ini
            </CardTitle>
            <TrendingUp className="text-momcha-brown" size={18} />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-momcha-text-dark">
              {summary.monthOrders}
            </div>
            <p className="text-xs text-momcha-text-light mt-1 hidden sm:block">
              Total order bulan ini
            </p>
          </CardContent>
        </Card>

        {/* Month Revenue */}
        <Card className="border-momcha-peach">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs lg:text-sm font-medium text-momcha-text-light">
              Pemasukan Bulan Ini
            </CardTitle>
            <DollarSign className="text-green-500" size={18} />
          </CardHeader>
          <CardContent>
            <div className="text-lg lg:text-2xl font-bold text-momcha-text-dark">
              {formatCurrency(summary.monthRevenue)}
            </div>
            <p className="text-xs text-momcha-text-light mt-1 hidden sm:block">
              Total pemasukan bulan ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid - Stack on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Today's Schedule */}
        <Card className="border-momcha-peach">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base lg:text-lg text-momcha-text-dark flex items-center gap-2">
                <Calendar size={18} className="text-momcha-coral" />
                Jadwal Hari Ini
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-blue-400 shrink-0" />
                  <span className="text-xs text-momcha-text-light">Lunas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-yellow-400 shrink-0" />
                  <span className="text-xs text-momcha-text-light">Belum Bayar</span>
                </div>
                <Link
                  href="/calendar"
                  className="text-xs text-momcha-coral hover:underline"
                >
                  Lihat Semua
                </Link>
              </div>
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
                    className={`flex items-start gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg transition-colors border-l-4 ${
                      order.payment_status === "paid"
                        ? "bg-blue-50 border-blue-400 hover:bg-blue-100"
                        : "bg-yellow-50 border-yellow-400 hover:bg-yellow-100"
                    }`}
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
                      className={`
                        shrink-0 text-xs px-2 py-1 rounded-full font-medium
                        ${
                          order.payment_status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      `}
                    >
                      {order.payment_status === "paid" ? "Lunas" : "Pending"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-momcha-peach">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base lg:text-lg text-momcha-text-dark flex items-center gap-2">
                <Clock size={18} className="text-momcha-pink" />
                Order Terbaru
              </CardTitle>
              <Link
                href="/orders"
                className="text-xs text-momcha-coral hover:underline"
              >
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
                        {formatDate(order.service_date)} ·{" "}
                        {formatTime(order.service_start_time)}
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
