"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  DollarSign,
  Loader2,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const limit = 10;

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit form
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = `?page=${page}&limit=${limit}`;
      const res = await api.getCustomers(params);

      if (res.success) {
        setCustomers(res.data);
        setTotalCustomers(res.pagination?.total || 0);
        setTotalPages(Math.ceil((res.pagination?.total || 0) / limit));
      }
    } catch (error) {
      console.error("Load customers error:", error);
      toast.error("Gagal memuat data customer");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Filter by search
  const filteredCustomers = customers.filter((customer) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  });

  // Open Edit Modal
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

  // Update Customer
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
    } catch (error) {
      console.error("Update customer error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  // Open Delete Modal
  function openDeleteModal(customer) {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  }

  // Delete Customer
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
    } catch (error) {
      console.error("Delete customer error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-momcha-text-dark">
            Customers
          </h1>
          <p className="text-momcha-text-light">Kelola data customer</p>
        </div>
      </div>

      {/* Search */}
      <Card className="border-momcha-peach">
        <CardContent className="pt-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-momcha-text-light"
              size={18}
            />
            <Input
              placeholder="Cari customer (nama, HP, email)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="border-momcha-peach">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-momcha-coral" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-momcha-text-light">
              <p>Tidak ada customer yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-momcha-cream border-b border-momcha-peach">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                      Customer
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                      Kontak
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                      Alamat
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                      Total Orders
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                      Total Spent
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-momcha-text-dark">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-momcha-peach">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-momcha-cream transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-momcha-peach flex items-center justify-center">
                            <User size={18} className="text-momcha-brown" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-momcha-text-dark">
                              {customer.name}
                            </p>
                            <p className="text-xs text-momcha-text-light">
                              Bergabung {formatDate(customer.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-momcha-text-dark">
                            <Phone
                              size={14}
                              className="text-momcha-text-light"
                            />
                            {customer.phone}
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-momcha-text-light">
                              <Mail size={14} />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {customer.address ? (
                          <div className="flex items-start gap-2 text-sm text-momcha-text-light max-w-xs">
                            <MapPin size={14} className="mt-0.5 shrink-0" />
                            <span className="line-clamp-2">
                              {customer.address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-momcha-text-light">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-momcha-text-dark">
                          <ShoppingBag
                            size={14}
                            className="text-momcha-text-light"
                          />
                          {customer.total_orders || 0} orders
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-momcha-text-dark">
                          <DollarSign size={14} className="text-green-600" />
                          {formatCurrency(customer.total_spent || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(customer)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Edit size={16} />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(customer)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
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
            Menampilkan {(page - 1) * limit + 1} -{" "}
            {Math.min(page * limit, totalCustomers)} dari {totalCustomers}{" "}
            customers
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={
                        page === pageNum
                          ? "bg-momcha-coral hover:bg-momcha-brown text-white"
                          : ""
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                } else if (pageNum === page - 2 || pageNum === page + 2) {
                  return (
                    <span key={pageNum} className="px-2 text-momcha-text-light">
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update informasi customer</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nama <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nama customer"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nomor HP <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder="08123456789"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Alamat</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                rows="3"
                placeholder="Alamat lengkap"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={actionLoading}
              className="bg-momcha-coral hover:bg-momcha-brown"
            >
              {actionLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Customer</DialogTitle>
            <DialogDescription>
              Customer yang dihapus tidak dapat dikembalikan
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
              <Trash2 className="text-red-600" size={24} />
              <div>
                <p className="text-sm font-medium text-red-900">
                  {selectedCustomer?.name}
                </p>
                <p className="text-xs text-red-700">
                  {selectedCustomer?.phone}
                </p>
              </div>
            </div>
            <p className="text-sm text-momcha-text-light mt-4">
              ⚠️ Customer yang memiliki order aktif tidak bisa dihapus
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Ya, Hapus Customer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
