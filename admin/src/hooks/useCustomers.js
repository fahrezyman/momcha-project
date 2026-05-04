import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

/**
 * useCustomers — state, pagination, dan CRUD logic untuk halaman daftar customer.
 *
 * @returns {object} State dan fungsi siap pakai
 */
export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const limit = 10;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "" });

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      let params = `?page=${page}&limit=${limit}`;
      if (search) params += `&search=${encodeURIComponent(search)}`;
      const res = await api.getCustomers(params);
      if (res.success) {
        setCustomers(res.data);
        setTotalCustomers(res.pagination?.total || 0);
        setTotalPages(Math.ceil((res.pagination?.total || 0) / limit));
      }
    } catch {
      toast.error("Gagal memuat data customer");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  function openEditModal(customer) {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
    });
    setShowEditModal(true);
  }

  function openDeleteModal(customer) {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  }

  async function handleUpdate() {
    if (!formData.name || !formData.phone) {
      toast.error("Nama dan nomor HP wajib diisi");
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.updateCustomer(selectedCustomer.id, formData);
      if (res.success) {
        toast.success("Customer berhasil diupdate!");
        setShowEditModal(false);
        loadCustomers();
      } else {
        toast.error(res.error?.message || "Gagal update customer");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setActionLoading(true);
      const res = await api.deleteCustomer(selectedCustomer.id);
      if (res.success) {
        toast.success("Customer berhasil dihapus!");
        setShowDeleteModal(false);
        loadCustomers();
      } else {
        if (res.error?.code === "HAS_ORDERS") {
          toast.error("Customer memiliki order aktif, tidak bisa dihapus!");
        } else {
          toast.error(res.error?.message || "Gagal menghapus customer");
        }
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  return {
    customers, loading,
    search, setSearch,
    page, setPage,
    totalPages, totalCustomers, limit,
    showEditModal, setShowEditModal,
    showDeleteModal, setShowDeleteModal,
    selectedCustomer, actionLoading,
    formData, setFormData,
    openEditModal, openDeleteModal,
    handleUpdate, handleDelete,
  };
}
