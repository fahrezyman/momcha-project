import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * useDashboard — data fetching dan komputasi untuk halaman dashboard.
 *
 * Mengambil semua order bulan ini, lalu menghitung:
 * - summary (today/month orders & revenue)
 * - jadwal hari ini (belum selesai/batal, diurutkan per waktu)
 * - 5 order terbaru
 *
 * @returns {{ loading, summary, todaySchedule, recentOrders }}
 */
export function useDashboard() {
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
      const today = now.toLocaleDateString("en-CA");
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDay = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      const lastDay = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDayOfMonth).padStart(2, "0")}`;

      const ordersRes = await api.getOrders(`?date_from=${firstDay}&date_to=${lastDay}`);
      if (!ordersRes.success) return;

      const orders = ordersRes.data;
      const todayDate = new Date(today);
      const todayOrders = orders.filter((o) => {
        if (!o.service_date) return false;
        const d = new Date(o.service_date);
        return (
          d.getFullYear() === todayDate.getFullYear() &&
          d.getMonth() === todayDate.getMonth() &&
          d.getDate() === todayDate.getDate()
        );
      });

      const sum = (list) =>
        list.filter((o) => o.payment_status === "paid")
          .reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0);

      setSummary({
        todayOrders: todayOrders.length,
        todayRevenue: sum(todayOrders),
        monthOrders: orders.length,
        monthRevenue: sum(orders),
      });

      setTodaySchedule(
        todayOrders
          .filter((o) => o.status !== "completed" && o.status !== "cancelled")
          .sort((a, b) => a.service_start_time.localeCompare(b.service_start_time)),
      );

      setRecentOrders(
        [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
      );
    } catch {
      // non-critical — dashboard shows zeros
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return { loading, summary, todaySchedule, recentOrders };
}
