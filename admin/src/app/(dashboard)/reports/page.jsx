"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Calendar,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Date range
  const [dateFrom, setDateFrom] = useState(
    format(startOfMonth(subMonths(new Date(), 2)), "yyyy-MM-dd"),
  );
  const [dateTo, setDateTo] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd"),
  );

  // Summary stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  async function loadData() {
    try {
      setLoading(true);

      // Load orders
      const ordersRes = await api.getOrders(
        `?date_from=${dateFrom}&date_to=${dateTo}`,
      );

      // Load customers
      const customersRes = await api.getCustomers();

      if (ordersRes.success) {
        const ordersData = ordersRes.data;
        setOrders(ordersData);

        // Calculate stats
        const paidOrders = ordersData.filter(
          (o) => o.payment_status === "paid",
        );
        const totalRevenue = paidOrders.reduce(
          (sum, o) => sum + parseFloat(o.total_amount || 0), // ← UPDATED
          0,
        );
        const totalOrders = ordersData.length;
        const averageOrderValue =
          paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

        setStats({
          totalRevenue,
          totalOrders,
          totalCustomers: customersRes.success
            ? customersRes.pagination?.total || 0
            : 0,
          averageOrderValue,
        });
      }

      if (customersRes.success) {
        setCustomers(customersRes.data);
      }
    } catch (error) {
      console.error("Load reports error:", error);
      toast.error("Gagal memuat data laporan");
    } finally {
      setLoading(false);
    }
  }

  // Prepare revenue chart data (group by date)
  const revenueChartData = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((acc, order) => {
      const date = order.service_date;
      const existing = acc.find((item) => item.date === date);

      if (existing) {
        existing.revenue += parseFloat(order.total_amount || 0); // ← UPDATED
        existing.orders += 1;
      } else {
        acc.push({
          date,
          revenue: parseFloat(order.total_amount || 0), // ← UPDATED
          orders: 1,
        });
      }

      return acc;
    }, [])
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      ...item,
      dateLabel: format(new Date(item.date), "d MMM", { locale: id }),
    }));

  // Top services - UPDATED AGGREGATION
  const servicesMap = new Map();

  orders.forEach((order) => {
    // Split services_names (comma-separated from backend GROUP_CONCAT)
    const servicesList = order.services_names?.split(", ") || [];
    const serviceCount = order.services_count || 1;
    const amountPerService = parseFloat(order.total_amount || 0) / serviceCount;

    servicesList.forEach((serviceName) => {
      if (serviceName && serviceName.trim()) {
        if (servicesMap.has(serviceName)) {
          const existing = servicesMap.get(serviceName);
          servicesMap.set(serviceName, {
            name: serviceName,
            count: existing.count + 1,
            revenue: existing.revenue + amountPerService,
          });
        } else {
          servicesMap.set(serviceName, {
            name: serviceName,
            count: 1,
            revenue: amountPerService,
          });
        }
      }
    });
  });

  const topServices = Array.from(servicesMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top customers
  const topCustomers = customers
    .map((customer) => ({
      ...customer,
      total_orders: customer.total_orders || 0,
      total_spent: customer.total_spent || 0,
    }))
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 5);

  // Payment status distribution
  const paymentDistribution = [
    {
      name: "Lunas",
      value: orders.filter((o) => o.payment_status === "paid").length,
      color: "#10b981",
    },
    {
      name: "Pending",
      value: orders.filter((o) => o.payment_status === "pending").length,
      color: "#f59e0b",
    },
    {
      name: "Cancelled",
      value: orders.filter((o) => o.payment_status === "cancelled").length,
      color: "#ef4444",
    },
  ].filter((item) => item.value > 0);

  // Export to CSV
  function exportToCSV() {
    const csvData = [
      [
        "Tanggal",
        "Customer",
        "Layanan",
        "Harga",
        "Status Pembayaran",
        "Status Order",
      ],
      ...orders.map((order) => [
        order.service_date,
        order.customer_name,
        order.services_names || "-", // ← UPDATED
        order.total_amount, // ← UPDATED
        order.payment_status,
        order.status,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-momcha-coral" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-momcha-text-dark">
            Laporan & Analisis
          </h1>
          <p className="text-momcha-text-light">Dashboard performa bisnis</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      {/* Date Filter */}
      <Card className="border-momcha-peach">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Calendar size={18} className="text-momcha-coral" />
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
              <span className="text-momcha-text-light">s/d</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
            <Button
              size="sm"
              onClick={() => {
                setDateFrom(format(startOfMonth(new Date()), "yyyy-MM-dd"));
                setDateTo(format(endOfMonth(new Date()), "yyyy-MM-dd"));
              }}
              variant="outline"
            >
              Bulan Ini
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="border-momcha-peach">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-momcha-text-light">
              Total Pemasukan
            </CardTitle>
            <DollarSign className="text-green-600" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-momcha-text-dark">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-momcha-text-light mt-1">
              Dari order yang sudah dibayar
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border-momcha-peach">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-momcha-text-light">
              Total Orders
            </CardTitle>
            <ShoppingBag className="text-momcha-coral" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-momcha-text-dark">
              {stats.totalOrders}
            </div>
            <p className="text-xs text-momcha-text-light mt-1">
              Semua status order
            </p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="border-momcha-peach">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-momcha-text-light">
              Total Customers
            </CardTitle>
            <Users className="text-momcha-pink" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-momcha-text-dark">
              {stats.totalCustomers}
            </div>
            <p className="text-xs text-momcha-text-light mt-1">
              Customer terdaftar
            </p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="border-momcha-peach">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-momcha-text-light">
              Rata-rata Order
            </CardTitle>
            <TrendingUp className="text-blue-600" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-momcha-text-dark">
              {formatCurrency(stats.averageOrderValue)}
            </div>
            <p className="text-xs text-momcha-text-light mt-1">Per transaksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-momcha-peach">
          <CardHeader>
            <CardTitle className="text-momcha-text-dark">
              Grafik Pemasukan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueChartData.length === 0 ? (
              <div className="text-center py-12 text-momcha-text-light">
                <p className="text-sm">Belum ada data pemasukan</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5D5C8" />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fill: "#5C4033", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: "#5C4033", fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "#FFF5EE",
                      border: "1px solid #F5D5C8",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#E08B8B"
                    strokeWidth={2}
                    name="Pemasukan"
                    dot={{ fill: "#E08B8B", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card className="border-momcha-peach">
          <CardHeader>
            <CardTitle className="text-momcha-text-dark">
              Top 5 Layanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topServices.length === 0 ? (
              <div className="text-center py-12 text-momcha-text-light">
                <p className="text-sm">Belum ada data layanan</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topServices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5D5C8" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#5C4033", fontSize: 11 }}
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: "#5C4033", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFF5EE",
                      border: "1px solid #F5D5C8",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#FF9DBD" name="Jumlah Order" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Distribution */}
        <Card className="border-momcha-peach">
          <CardHeader>
            <CardTitle className="text-momcha-text-dark">
              Distribusi Status Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentDistribution.length === 0 ? (
              <div className="text-center py-12 text-momcha-text-light">
                <p className="text-sm">Belum ada data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFF5EE",
                      border: "1px solid #F5D5C8",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="border-momcha-peach">
          <CardHeader>
            <CardTitle className="text-momcha-text-dark">
              Top 5 Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <div className="text-center py-12 text-momcha-text-light">
                <p className="text-sm">Belum ada data customer</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 bg-momcha-cream rounded-lg hover:bg-momcha-peach transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-momcha-coral text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-momcha-text-dark">
                          {customer.name}
                        </p>
                        <p className="text-xs text-momcha-text-light">
                          {customer.total_orders || 0} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-momcha-text-dark">
                        {formatCurrency(customer.total_spent || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
