import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * useOrders — state dan logic untuk halaman daftar order.
 *
 * Mengelola filter status/payment, pagination server-side,
 * dan filter search client-side (karena search hanya menyaring data yang sudah diload).
 *
 * @returns {object} State dan setter siap pakai
 */
export function useOrders() {
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
    } catch {
      // non-critical — table stays empty
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
    const q = search.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(q) ||
      order.customer_name.toLowerCase().includes(q) ||
      order.customer_phone.includes(q) ||
      (order.services_names && order.services_names.toLowerCase().includes(q))
    );
  });

  return {
    orders: filteredOrders,
    loading,
    search, setSearch,
    statusFilter, setStatusFilter,
    paymentFilter, setPaymentFilter,
    currentPage, setCurrentPage,
    totalPages,
    totalOrders,
    limit,
  };
}
