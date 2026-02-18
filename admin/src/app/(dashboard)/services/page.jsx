"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Power,
  Loader2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false); // ← TAMBAH
  const [showDeleteModal, setShowDeleteModal] = useState(false); // ← TAMBAH
  const [editingService, setEditingService] = useState(null);
  const [selectedService, setSelectedService] = useState(null); // ← TAMBAH
  const [actionLoading, setActionLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
  });

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showActiveOnly]);

  async function loadServices() {
    try {
      setLoading(true);
      const params = showActiveOnly ? "?is_active=true" : "";
      const res = await api.getServices(params);

      if (res.success) {
        setServices(res.data);
      }
    } catch (error) {
      console.error("Load services error:", error);
      toast.error("Gagal memuat data service");
    } finally {
      setLoading(false);
    }
  }

  // Filter by search
  const filteredServices = services.filter((service) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      service.name.toLowerCase().includes(searchLower) ||
      service.description?.toLowerCase().includes(searchLower)
    );
  });

  // Reset form
  function resetForm() {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration_minutes: "",
    });
  }

  // Open Create Modal
  function openCreateModal() {
    resetForm();
    setShowCreateModal(true);
  }

  // Open Edit Modal
  function openEditModal(service) {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price,
      duration_minutes: service.duration_minutes,
    });
    setShowEditModal(true);
  }

  // Create Service
  async function handleCreate() {
    if (!formData.name || !formData.price || !formData.duration_minutes) {
      toast.error("Nama, harga, dan durasi wajib diisi");
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.createService(formData);

      if (res.success) {
        toast.success("Service berhasil dibuat!");
        setShowCreateModal(false);
        resetForm();
        loadServices();
      } else {
        toast.error(res.error?.message || "Gagal membuat service");
      }
    } catch (error) {
      console.error("Create service error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  // Update Service
  async function handleUpdate() {
    if (!formData.name || !formData.price || !formData.duration_minutes) {
      toast.error("Nama, harga, dan durasi wajib diisi");
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.updateService(editingService.id, formData);

      if (res.success) {
        toast.success("Service berhasil diupdate!");
        setShowEditModal(false);
        setEditingService(null);
        resetForm();
        loadServices();
      } else {
        toast.error(res.error?.message || "Gagal update service");
      }
    } catch (error) {
      console.error("Update service error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  // Toggle Active - Open Modal
  function openToggleModal(service) {
    setSelectedService(service);
    setShowToggleModal(true);
  }

  // Confirm Toggle
  async function confirmToggle() {
    if (!selectedService) return;

    const newStatus = !selectedService.is_active;

    try {
      setActionLoading(true);
      const res = await api.updateService(selectedService.id, {
        is_active: newStatus,
      });

      if (res.success) {
        toast.success(
          `Service berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"}!`,
        );
        setShowToggleModal(false);
        loadServices();
      } else {
        toast.error(res.error?.message || "Gagal update status");
      }
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  // Delete - Open Modal
  function openDeleteModal(service) {
    setSelectedService(service);
    setShowDeleteModal(true);
  }

  // Confirm Delete
  async function confirmDelete() {
    if (!selectedService) return;

    try {
      setActionLoading(true);
      const res = await api.deleteService(selectedService.id);

      if (res.success) {
        toast.success("Service berhasil dihapus!");
        setShowDeleteModal(false);
        loadServices();
      } else {
        toast.error(res.error?.message || "Gagal menghapus service");
      }
    } catch (error) {
      console.error("Delete service error:", error);
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
          <h1 className="text-2xl font-bold text-momcha-text-dark">Service</h1>
          <p className="text-momcha-text-light">
            Kelola service yang ditawarkan
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-momcha-coral hover:bg-momcha-brown text-white"
        >
          <Plus size={18} className="mr-2" />
          Tambah Service
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-momcha-peach">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-momcha-text-light"
                size={18}
              />
              <Input
                placeholder="Cari service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Active */}
            <Button
              variant={showActiveOnly ? "default" : "outline"}
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              className={
                showActiveOnly ? "bg-momcha-coral hover:bg-momcha-brown" : ""
              }
            >
              {showActiveOnly ? "Semua Service" : "Aktif Saja"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card className="border-momcha-peach">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-momcha-coral" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12 text-momcha-text-light">
              <p>Tidak ada service yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-momcha-cream border-b border-momcha-peach">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                      Service
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                      Deskripsi
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                      Harga
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-momcha-text-dark">
                      Durasi
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
                  {filteredServices.map((service) => (
                    <tr
                      key={service.id}
                      className="hover:bg-momcha-cream transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-momcha-text-dark">
                          {service.name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-momcha-text-light line-clamp-2 max-w-xs">
                          {service.description || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-momcha-text-dark">
                          {formatCurrency(service.price)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-momcha-text-dark">
                          <Clock size={14} className="text-momcha-text-light" />
                          {service.duration_minutes} menit
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            service.is_active
                              ? "bg-green-100 text-green-700 border-0"
                              : "bg-gray-100 text-gray-700 border-0"
                          }
                        >
                          {service.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(service)}
                            className="text-momcha-coral hover:bg-momcha-cream"
                          >
                            <Edit size={16} />
                          </Button>

                          {/* Toggle Active */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openToggleModal(service)} // ← GANTI
                            className={
                              service.is_active
                                ? "text-yellow-600 hover:bg-yellow-50"
                                : "text-green-600 hover:bg-green-50"
                            }
                          >
                            <Power size={16} />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(service)} // ← GANTI
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

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Service Baru</DialogTitle>
            <DialogDescription>
              Isi form di bawah untuk menambah service
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nama Service <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Pijat Laktasi"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                rows="3"
                placeholder="Deskripsi singkat service"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Harga <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="150000"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Durasi (menit) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="60"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleCreate}
              disabled={actionLoading}
              className="bg-momcha-coral hover:bg-momcha-brown"
            >
              {actionLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update informasi service</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nama Service <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Pijat Laktasi"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                rows="3"
                placeholder="Deskripsi singkat service"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Harga <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="150000"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Durasi (menit) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="60"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: e.target.value,
                    })
                  }
                />
              </div>
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

      {/* Toggle Active Modal */}
      <Dialog open={showToggleModal} onOpenChange={setShowToggleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedService?.is_active ? "Nonaktifkan" : "Aktifkan"} Service
            </DialogTitle>
            <DialogDescription>
              {selectedService?.is_active
                ? "Service yang dinonaktifkan tidak akan muncul di daftar order baru"
                : "Service akan muncul kembali di daftar order baru"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-momcha-cream rounded-lg">
              <Power
                className={
                  selectedService?.is_active
                    ? "text-yellow-600"
                    : "text-green-600"
                }
                size={24}
              />
              <div>
                <p className="text-sm font-medium text-momcha-text-dark">
                  {selectedService?.name}
                </p>
                <p className="text-xs text-momcha-text-light">
                  {formatCurrency(selectedService?.price)} ·{" "}
                  {selectedService?.duration_minutes} menit
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowToggleModal(false)}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              onClick={confirmToggle}
              disabled={actionLoading}
              className={
                selectedService?.is_active
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }
            >
              {actionLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Power size={16} className="mr-2" />
                  {selectedService?.is_active
                    ? "Ya, Nonaktifkan"
                    : "Ya, Aktifkan"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Service</DialogTitle>
            <DialogDescription>
              service yang dihapus tidak dapat dikembalikan
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
              <Trash2 className="text-red-600" size={24} />
              <div>
                <p className="text-sm font-medium text-red-900">
                  {selectedService?.name}
                </p>
                <p className="text-xs text-red-700">
                  {formatCurrency(selectedService?.price)} ·{" "}
                  {selectedService?.duration_minutes} menit
                </p>
              </div>
            </div>
            <p className="text-sm text-momcha-text-light mt-4">
              ⚠️ Pastikan tidak ada order aktif menggunakan service ini
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
              onClick={confirmDelete}
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
                  Ya, Hapus Service
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
