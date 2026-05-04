"use client";

import { useReports } from "@/hooks/useReports";
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
import { DollarSign, ShoppingBag, Users, TrendingUp, Calendar, Download } from "lucide-react";
import { ReportsPageSkeleton } from "@/components/skeletons";

export default function ReportsPage() {
  const {
    loading, stats,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    revenueChartData, topServices, topCustomers, paymentDistribution,
    exportToCSV, setThisMonth,
  } = useReports();

  if (loading) return <ReportsPageSkeleton />;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-momcha-text-dark">Laporan & Analisis</h1>
          <p className="text-sm text-momcha-text-light">Dashboard performa bisnis</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2 w-full sm:w-auto" size="sm">
          <Download size={16} />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>

      {/* Date filter */}
      <Card className="border-momcha-peach">
        <CardContent className="pt-4 lg:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Calendar size={18} className="text-momcha-coral hidden sm:block" />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full sm:w-40"
              />
              <span className="text-momcha-text-light text-center sm:inline hidden">s/d</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
            <Button size="sm" onClick={setThisMonth} variant="outline" className="w-full sm:w-auto">
              Bulan Ini
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: "Total Pemasukan", value: formatCurrency(stats.totalRevenue), icon: DollarSign, iconClass: "text-green-600", sub: "Dari order yang sudah dibayar" },
          { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, iconClass: "text-momcha-coral", sub: "Semua status order" },
          { label: "Total Customers", value: stats.totalCustomers, icon: Users, iconClass: "text-momcha-pink", sub: "Customer terdaftar" },
          { label: "Rata-rata Order", value: formatCurrency(stats.averageOrderValue), icon: TrendingUp, iconClass: "text-blue-600", sub: "Per transaksi" },
        ].map(({ label, value, icon: Icon, iconClass, sub }) => (
          <Card key={label} className="border-momcha-peach">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs lg:text-sm font-medium text-momcha-text-light">
                {label}
              </CardTitle>
              <Icon className={iconClass} size={18} />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-momcha-text-dark">{value}</div>
              <p className="text-xs text-momcha-text-light mt-1 hidden sm:block">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="border-momcha-peach">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg text-momcha-text-dark">Grafik Pemasukan</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueChartData.length === 0 ? (
              <div className="text-center py-12 text-momcha-text-light">
                <p className="text-sm">Belum ada data pemasukan</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5D5C8" />
                  <XAxis dataKey="dateLabel" tick={{ fill: "#5C4033", fontSize: 11 }} />
                  <YAxis
                    tick={{ fill: "#5C4033", fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => formatCurrency(v)}
                    contentStyle={{ backgroundColor: "#FFF5EE", border: "1px solid #F5D5C8", borderRadius: "8px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#E08B8B"
                    strokeWidth={2}
                    name="Pemasukan"
                    dot={{ fill: "#E08B8B", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-momcha-peach">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg text-momcha-text-dark">Top 5 Layanan</CardTitle>
          </CardHeader>
          <CardContent>
            {topServices.length === 0 ? (
              <div className="text-center py-12 text-momcha-text-light">
                <p className="text-sm">Belum ada data layanan</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topServices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5D5C8" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#5C4033", fontSize: 10 }}
                    angle={-20}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: "#5C4033", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFF5EE", border: "1px solid #F5D5C8", borderRadius: "8px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="count" fill="#FF9DBD" name="Jumlah Order" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="border-momcha-peach">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg text-momcha-text-dark">
              Distribusi Status Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentDistribution.length === 0 ? (
              <div className="text-center py-12 text-momcha-text-light">
                <p className="text-sm">Belum ada data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={70}
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
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-momcha-peach">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg text-momcha-text-dark">Top 5 Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <div className="text-center py-12 text-momcha-text-light">
                <p className="text-sm">Belum ada data customer</p>
              </div>
            ) : (
              <div className="space-y-2 lg:space-y-3">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-2 lg:p-3 bg-momcha-cream rounded-lg hover:bg-momcha-peach transition-colors"
                  >
                    <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                      <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-momcha-coral text-white flex items-center justify-center text-xs lg:text-sm font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs lg:text-sm font-medium text-momcha-text-dark truncate">
                          {customer.name}
                        </p>
                        <p className="text-xs text-momcha-text-light">
                          {customer.total_orders} orders
                        </p>
                      </div>
                    </div>
                    <p className="text-xs lg:text-sm font-bold text-momcha-text-dark shrink-0">
                      {formatCurrency(customer.total_spent)}
                    </p>
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
