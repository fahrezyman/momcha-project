"use client";

import { useOrders } from "@/hooks/useOrders";
import { formatCurrency, formatDate, formatTime, ORDER_STATUS, PAYMENT_STATUS } from "@/constants";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/Pagination";
import { Plus, Search, Calendar, User } from "lucide-react";
import Link from "next/link";
import { TableRowsSkeleton } from "@/components/skeletons";

export default function OrdersPage() {
  const {
    orders, loading,
    search, setSearch,
    statusFilter, setStatusFilter,
    paymentFilter, setPaymentFilter,
    currentPage, setCurrentPage,
    totalPages, totalOrders, limit,
  } = useOrders();

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-momcha-text-dark">Orders</h1>
          <p className="text-sm text-momcha-text-light">Kelola semua order customer</p>
        </div>
        <Link href="/orders/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-momcha-coral hover:bg-momcha-brown text-white text-sm h-9">
            <Plus size={16} className="mr-2" />
            Buat Order Baru
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-momcha-peach">
        <CardContent className="pt-4 lg:pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-momcha-text-light" size={16} />
              <Input
                placeholder="Cari order..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-momcha-peach rounded-lg text-sm h-9 focus:outline-none focus:ring-2 focus:ring-momcha-coral"
            >
              <option value="">Semua Status</option>
              {Object.entries(ORDER_STATUS).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-momcha-peach rounded-lg text-sm h-9 focus:outline-none focus:ring-2 focus:ring-momcha-coral"
            >
              <option value="">Semua Pembayaran</option>
              {Object.entries(PAYMENT_STATUS).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-momcha-peach">
        <CardContent className="p-0">
          {loading ? (
            <TableRowsSkeleton />
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-momcha-text-light">
              <p className="text-sm">Tidak ada order yang ditemukan</p>
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="lg:hidden divide-y divide-momcha-peach">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block p-4 hover:bg-momcha-cream transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-momcha-coral truncate">
                          {order.order_number}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <User size={12} className="text-momcha-text-light shrink-0" />
                          <p className="text-xs text-momcha-text-dark truncate">
                            {order.customer_name}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-momcha-coral shrink-0">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                    <div className="mb-2">
                      <p className="text-xs text-momcha-text-dark line-clamp-1">
                        {order.services_names || "-"}
                      </p>
                      {order.services_count > 1 && (
                        <p className="text-xs text-momcha-text-light">{order.services_count} layanan</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-3 text-xs text-momcha-text-light">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{formatDate(order.service_date)}</span>
                      </div>
                      <span>•</span>
                      <span>{formatTime(order.service_start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PaymentStatusBadge status={order.payment_status} />
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-momcha-cream border-b border-momcha-peach">
                    <tr>
                      {["Order #", "Customer", "Layanan", "Tanggal", "Waktu", "Total", "Pembayaran", "Status", ""].map((h, i) => (
                        <th
                          key={i}
                          className={`px-6 py-3 text-xs font-medium text-momcha-text-dark ${i === 8 ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-momcha-peach">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-momcha-cream transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-sm font-medium text-momcha-coral hover:underline"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-momcha-text-dark">{order.customer_name}</p>
                          <p className="text-xs text-momcha-text-light">{order.customer_phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-momcha-text-dark line-clamp-2 max-w-xs">
                            {order.services_names || "-"}
                          </p>
                          {order.services_count > 1 && (
                            <p className="text-xs text-momcha-text-light mt-1">
                              {order.services_count} layanan
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-momcha-text-dark">
                          {formatDate(order.service_date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-momcha-text-dark">
                          {formatTime(order.service_start_time)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-momcha-text-dark">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <PaymentStatusBadge status={order.payment_status} />
                        </td>
                        <td className="px-6 py-4">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="text-momcha-coral hover:bg-momcha-cream">
                              Detail
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-momcha-text-light">
            {(currentPage - 1) * limit + 1} –{" "}
            {Math.min(currentPage * limit, totalOrders)} dari {totalOrders}
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
