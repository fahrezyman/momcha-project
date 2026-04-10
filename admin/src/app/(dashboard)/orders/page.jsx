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
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  // Pagination
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, paymentFilter]);

  // Filter by search (client-side)
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
      <Badge className={`${STATUS_BADGE_COLORS[statusData.color]} border-0`}>
        {statusData.label}
      </Badge>
    );
  }

  function getPaymentBadge(status) {
    const statusData = PAYMENT_STATUS[status] || { label: status, color: "gray" };
    return (
      <Badge className={`${STATUS_BADGE_COLORS[statusData.color]} border-0`}>
        {statusData.label}
      </Badge>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-momcha-text-dark">Orders</h1>
          <p className="text-momcha-text-light">Kelola semua order customer</p>
        </div>
        <Link href="/orders/create">
          <Button className="bg-momcha-coral hover:bg-momcha-brown text-white">
            <Plus size={18} className="mr-2" />
            Buat Order Baru
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-momcha-peach">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-momcha-text-light"
                size={18}
              />
              <Input
                placeholder="Cari order, customer, layanan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-momcha-peach rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-momcha-coral"
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
              className="px-3 py-2 border border-momcha-peach rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-momcha-coral"
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

      {/* Orders Table */}
      <Card className="border-momcha-peach">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-momcha-coral" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-momcha-text-light">
              <p>Tidak ada order yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                      {/* Order Number */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-sm font-medium text-momcha-coral hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </td>

                      {/* Customer */}
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

                      {/* Services */}
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

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-momcha-text-dark">
                        {formatDate(order.service_date)}
                      </td>

                      {/* Time */}
                      <td className="px-6 py-4 text-sm text-momcha-text-dark">
                        {formatTime(order.service_start_time)}
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-4 text-sm font-medium text-momcha-text-dark">
                        {formatCurrency(order.total_amount)}
                      </td>

                      {/* Payment Status */}
                      <td className="px-6 py-4">
                        {getPaymentBadge(order.payment_status)}
                      </td>

                      {/* Order Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Actions */}
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
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-momcha-text-light">
            Menampilkan {(currentPage - 1) * limit + 1} -{" "}
            {Math.min(currentPage * limit, totalOrders)} dari {totalOrders}{" "}
            orders
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
