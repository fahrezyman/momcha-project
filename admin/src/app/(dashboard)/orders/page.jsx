"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  formatCurrency,
  formatDate,
  formatTime,
  ORDER_STATUS,
  PAYMENT_STATUS,
  STATUS_BADGE_COLORS,
} from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";
import { TableRowsSkeleton } from "@/components/skeletons";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 10;

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      let params = `?page=${currentPage}&limit=${limit}`;
      if (statusFilter) params += `&status=${statusFilter}`;
      if (paymentFilter) params += `&payment_status=${paymentFilter}`;

      const res = await api.getOrders(params);

      if (res.success) {
        setOrders(res.data);
        setTotalOrders(res.pagination?.total || 0);
        setTotalPages(Math.ceil((res.pagination?.total || 0) / limit));
      }
    } catch (error) {
      console.error("Load orders error:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, paymentFilter, currentPage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, paymentFilter]);

  const filteredOrders = orders.filter((order) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(searchLower) ||
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.customer_phone.includes(searchLower) ||
      (order.services_names &&
        order.services_names.toLowerCase().includes(searchLower))
    );
  });

  function getStatusBadge(status) {
    const statusData = ORDER_STATUS[status] || { label: status, color: "gray" };
    return (
      <Badge className={`${STATUS_BADGE_COLORS[statusData.color]} border-0 text-xs`}>
        {statusData.label}
      </Badge>
    );
  }

  function getPaymentBadge(status) {
    const statusData = PAYMENT_STATUS[status] || { label: status, color: "gray" };
    return (
      <Badge className={`${STATUS_BADGE_COLORS[statusData.color]} border-0 text-xs`}>
        {statusData.label}
      </Badge>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-momcha-text-dark">
            Orders
          </h1>
          <p className="text-sm text-momcha-text-light">
            Kelola semua order customer
          </p>
        </div>
        <Link href="/orders/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-momcha-coral hover:bg-momcha-brown text-white text-sm h-9">
            <Plus size={16} className="mr-2" />
            Buat Order Baru
          </Button>
        </Link>
      </div>

      {/* Filters - Responsive */}
      <Card className="border-momcha-peach">
        <CardContent className="pt-4 lg:pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-momcha-text-light"
                size={16}
              />
              <Input
                placeholder="Cari order..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-momcha-peach rounded-lg text-sm h-9 focus:outline-none focus:ring-2 focus:ring-momcha-coral"
            >
              <option value="">Semua Status</option>
              {Object.entries(ORDER_STATUS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-momcha-peach rounded-lg text-sm h-9 focus:outline-none focus:ring-2 focus:ring-momcha-coral"
            >
              <option value="">Semua Pembayaran</option>
              {Object.entries(PAYMENT_STATUS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders - Mobile: Cards, Desktop: Table */}
      <Card className="border-momcha-peach">
        <CardContent className="p-0">
          {loading ? (
            <TableRowsSkeleton />
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-momcha-text-light">
              <p className="text-sm">Tidak ada order yang ditemukan</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW - Cards */}
              <div className="lg:hidden divide-y divide-momcha-peach">
                {filteredOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block p-4 hover:bg-momcha-cream transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-momcha-coral truncate">
                          {order.order_number}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <User
                            size={12}
                            className="text-momcha-text-light shrink-0"
                          />
                          <p className="text-xs text-momcha-text-dark truncate">
                            {order.customer_name}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-momcha-coral shrink-0">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>

                    {/* Services */}
                    <div className="mb-2">
                      <p className="text-xs text-momcha-text-dark line-clamp-1">
                        {order.services_names || "-"}
                      </p>
                      {order.services_count > 1 && (
                        <p className="text-xs text-momcha-text-light">
                          {order.services_count} layanan
                        </p>
                      )}
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-3 mb-3 text-xs text-momcha-text-light">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{formatDate(order.service_date)}</span>
                      </div>
                      <span>•</span>
                      <span>{formatTime(order.service_start_time)}</span>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2">
                      {getPaymentBadge(order.payment_status)}
                      {getStatusBadge(order.status)}
                    </div>
                  </Link>
                ))}
              </div>

              {/* DESKTOP VIEW - Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-momcha-cream border-b border-momcha-peach">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                        Order #
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                        Customer
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                        Layanan
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                        Tanggal
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                        Waktu
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                        Total
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                        Pembayaran
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                        Status
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-momcha-text-dark">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-momcha-peach">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-momcha-cream transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-sm font-medium text-momcha-coral hover:underline"
                          >
                            {order.order_number}
                          </Link>
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-momcha-text-dark">
                              {order.customer_name}
                            </p>
                            <p className="text-xs text-momcha-text-light">
                              {order.customer_phone}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-momcha-text-dark line-clamp-2">
                              {order.services_names || "-"}
                            </p>
                            {order.services_count > 1 && (
                              <p className="text-xs text-momcha-text-light mt-1">
                                {order.services_count} layanan
                              </p>
                            )}
                          </div>
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
                          {getPaymentBadge(order.payment_status)}
                        </td>

                        <td className="px-6 py-4">
                          {getStatusBadge(order.status)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link href={`/orders/${order.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-momcha-coral hover:bg-momcha-cream"
                            >
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

      {/* Pagination - Responsive */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-momcha-text-light">
            {(currentPage - 1) * limit + 1} -{" "}
            {Math.min(currentPage * limit, totalOrders)} dari {totalOrders}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 text-xs"
            >
              <ChevronLeft size={14} className="mr-1" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;

                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 p-0 text-xs ${
                        currentPage === page
                          ? "bg-momcha-coral hover:bg-momcha-brown text-white"
                          : ""
                      }`}
                    >
                      {page}
                    </Button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span
                      key={page}
                      className="px-1 text-xs text-momcha-text-light"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 text-xs"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
