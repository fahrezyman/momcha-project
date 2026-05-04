import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { id } from "date-fns/locale";

/**
 * useReports — data fetching dan semua komputasi untuk halaman laporan.
 *
 * Menghitung stats, chart data, top services, top customers, dan distribusi
 * pembayaran langsung di hook sehingga page hanya perlu render chart.
 *
 * @returns {object} Data siap render + kontrol filter tanggal + exportToCSV
 */
export function useReports() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dateFrom, setDateFrom] = useState(
    format(startOfMonth(subMonths(new Date(), 2)), "yyyy-MM-dd"),
  );
  const [dateTo, setDateTo] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd"),
  );
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [ordersRes, customersRes] = await Promise.all([
          api.getOrders(`?date_from=${dateFrom}&date_to=${dateTo}`),
          api.getCustomers(),
        ]);

        if (ordersRes.success) {
          const data = ordersRes.data;
          setOrders(data);
          const paid = data.filter((o) => o.payment_status === "paid");
          const totalRevenue = paid.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
          setStats({
            totalRevenue,
            totalOrders: data.length,
            totalCustomers: customersRes.success ? customersRes.pagination?.total || 0 : 0,
            averageOrderValue: paid.length > 0 ? totalRevenue / paid.length : 0,
          });
        }
        if (customersRes.success) setCustomers(customersRes.data);
      } catch {
        toast.error("Gagal memuat data laporan");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dateFrom, dateTo]);

  // ── Computed chart data ───────────────────────────────────────────────────

  const revenueChartData = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((acc, order) => {
      const date = order.service_date;
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.revenue += parseFloat(order.total_amount || 0);
        existing.orders += 1;
      } else {
        acc.push({ date, revenue: parseFloat(order.total_amount || 0), orders: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      ...item,
      dateLabel: format(new Date(item.date), "d MMM", { locale: id }),
    }));

  const servicesMap = new Map();
  orders.forEach((order) => {
    const servicesList = order.services_names?.split(", ") || [];
    const serviceCount = order.services_count || 1;
    const amountPerService = parseFloat(order.total_amount || 0) / serviceCount;
    servicesList.forEach((name) => {
      if (name?.trim()) {
        const existing = servicesMap.get(name);
        servicesMap.set(name, {
          name,
          count: (existing?.count || 0) + 1,
          revenue: (existing?.revenue || 0) + amountPerService,
        });
      }
    });
  });
  const topServices = Array.from(servicesMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topCustomers = customers
    .map((c) => ({ ...c, total_orders: c.total_orders || 0, total_spent: c.total_spent || 0 }))
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 5);

  const paymentDistribution = [
    { name: "Lunas", value: orders.filter((o) => o.payment_status === "paid").length, color: "#10b981" },
    { name: "Pending", value: orders.filter((o) => o.payment_status === "pending").length, color: "#f59e0b" },
    { name: "Cancelled", value: orders.filter((o) => o.payment_status === "cancelled").length, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  // ── Actions ───────────────────────────────────────────────────────────────

  function exportToCSV() {
    const csvData = [
      ["Tanggal", "Customer", "Layanan", "Harga", "Status Pembayaran", "Status Order"],
      ...orders.map((o) => [
        o.service_date, o.customer_name, o.services_names || "-",
        o.total_amount, o.payment_status, o.status,
      ]),
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${dateFrom}-${dateTo}.csv`;
    a.click();
    toast.success("Laporan berhasil diexport!");
  }

  function setThisMonth() {
    setDateFrom(format(startOfMonth(new Date()), "yyyy-MM-dd"));
    setDateTo(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  }

  return {
    loading, stats,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    revenueChartData, topServices, topCustomers, paymentDistribution,
    exportToCSV, setThisMonth,
  };
}
