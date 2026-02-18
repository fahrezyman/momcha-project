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

      // Get today's date
      const today = new Date().toISOString().split("T")[0];

      // Get this month's date range
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      // Fetch orders
      const ordersRes = await api.getOrders(
        `?date_from=${firstDay}&date_to=${lastDay}`,
      );

      if (ordersRes.success) {
        const orders = ordersRes.data;

        // Calculate summary
        const todayOrders = orders.filter((o) => o.service_date === today);
        const todayRevenue = todayOrders
          .filter((o) => o.payment_status === "paid")
          .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0); // ← FIX: total_amount

        const monthOrders = orders.length;
        const monthRevenue = orders
          .filter((o) => o.payment_status === "paid")
          .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0); // ← FIX: total_amount

        setSummary({
          todayOrders: todayOrders.length,
          todayRevenue,
          monthOrders,
          monthRevenue,
        });

        // Today's schedule
        setTodaySchedule(
          todayOrders.sort((a, b) =>
            a.service_start_time.localeCompare(b.service_start_time),
          ),
        );

        // Recent orders (last 5)
        setRecentOrders(orders.slice(0, 5));
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
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-momcha-text-dark mb-2">
          Selamat Datang! 👋
        </h1>
        <p className="text-momcha-text-light">
          Ini adalah ringkasan aktivitas hari ini
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Orders */}
        <Card className="border-momcha-peach">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-momcha-text-light">
              Orders Hari Ini
            </CardTitle>
            <ShoppingBag className="text-momcha-coral" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-momcha-text-dark">
              {summary.todayOrders}
            </div>
            <p className="text-xs text-momcha-text-light mt-1">
              Total order hari ini
            </p>
          </CardContent>
        </Card>

        {/* Today Revenue */}
        <Card className="border-momcha-peach">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-momcha-text-light">
              Pemasukan Hari Ini
            </CardTitle>
            <DollarSign className="text-momcha-pink" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-momcha-text-dark">
              {formatCurrency(summary.todayRevenue)}
            </div>
            <p className="text-xs text-momcha-text-light mt-1">
              Dari order yang sudah bayar
            </p>
          </CardContent>
        </Card>

        {/* Month Orders */}
        <Card className="border-momcha-peach">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-momcha-text-light">
              Orders Bulan Ini
            </CardTitle>
            <TrendingUp className="text-momcha-brown" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-momcha-text-dark">
              {summary.monthOrders}
            </div>
            <p className="text-xs text-momcha-text-light mt-1">
              Total order bulan ini
            </p>
          </CardContent>
        </Card>

        {/* Month Revenue */}
        <Card className="border-momcha-peach">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-momcha-text-light">
              Pemasukan Bulan Ini
            </CardTitle>
            <DollarSign className="text-green-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-momcha-text-dark">
              {formatCurrency(summary.monthRevenue)}
            </div>
            <p className="text-xs text-momcha-text-light mt-1">
              Total pemasukan bulan ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card className="border-momcha-peach">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-momcha-text-dark flex items-center gap-2">
                <Calendar size={20} className="text-momcha-coral" />
                Jadwal Hari Ini
              </CardTitle>
              <Link
                href="/calendar"
                className="text-xs text-momcha-coral hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8 text-momcha-text-light">
                <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Tidak ada jadwal hari ini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-momcha-cream hover:bg-momcha-peach transition-colors"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-momcha-coral flex flex-col items-center justify-center text-white">
                      <span className="text-xs font-medium">
                        {formatTime(order.service_start_time)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-momcha-text-dark">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-momcha-text-light truncate">
                        {order.services_names || "-"}{" "}
                        {/* ← FIX: services_names */}
                      </p>
                      <p className="text-xs font-medium text-momcha-coral mt-1">
                        {formatCurrency(order.total_amount)}{" "}
                        {/* ← FIX: total_amount */}
                      </p>
                    </div>
                    <span
                      className={`
                      text-xs px-2 py-1 rounded-full font-medium
                      ${
                        order.payment_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    `}
                    >
                      {order.payment_status === "paid" ? "Lunas" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-momcha-peach">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-momcha-text-dark flex items-center gap-2">
                <Clock size={20} className="text-momcha-pink" />
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
                <ShoppingBag size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada order</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-momcha-cream transition-colors"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-full bg-momcha-peach flex items-center justify-center">
                      <User size={18} className="text-momcha-brown" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-momcha-text-dark">
                            {order.order_number}
                          </p>
                          <p className="text-xs text-momcha-text-light">
                            {order.customer_name}
                          </p>
                        </div>
                        <p className="text-xs font-medium text-momcha-coral">
                          {formatCurrency(order.total_amount)}{" "}
                          {/* ← FIX: total_amount */}
                        </p>
                      </div>
                      <p className="text-xs text-momcha-text-light mt-1">
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
