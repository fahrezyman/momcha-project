"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  GripVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { TableRowsSkeleton } from "@/components/skeletons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Sortable Desktop Row ---
function SortableRow({ service, isDragEnabled, onEdit, onToggle, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: service.id, disabled: !isDragEnabled });

  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="hover:bg-momcha-cream transition-colors"
    >
      <td className="px-3 py-4 w-10">
        {isDragEnabled ? (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-momcha-text-light hover:text-momcha-coral p-1 rounded"
            title="Seret untuk mengubah urutan"
          >
            <GripVertical size={16} />
          </button>
        ) : (
          <div className="w-7" />
        )}
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-medium text-momcha-text-dark">{service.name}</p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-momcha-text-light line-clamp-2 max-w-xs">
          {service.description || "-"}
        </p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-medium text-momcha-text-dark">
          {formatCurrency(service.price)}
        </p>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-momcha-text-dark">
          <Clock size={14} className="text-momcha-text-light" />
          {service.duration_minutes} menit
        </div>
      </td>
      <td className="px-4 py-4">
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
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(service)}
            className="text-momcha-coral hover:bg-momcha-cream"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(service)}
            className={
              service.is_active
                ? "text-yellow-600 hover:bg-yellow-50"
                : "text-green-600 hover:bg-green-50"
            }
          >
            <Power size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(service)}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// --- Sortable Mobile Card ---
function SortableCard({ service, isDragEnabled, onEdit, onToggle, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: service.id, disabled: !isDragEnabled });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="p-4 hover:bg-momcha-cream transition-colors"
    >
      <div className="flex items-start gap-2">
        {isDragEnabled && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-momcha-text-light hover:text-momcha-coral pt-0.5 shrink-0"
          >
            <GripVertical size={18} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-momcha-text-dark truncate">{service.name}</p>
              <p className="text-xs text-momcha-text-light line-clamp-2 mt-0.5">
                {service.description || "-"}
              </p>
            </div>
            <Badge
              className={`shrink-0 text-xs ${
                service.is_active
                  ? "bg-green-100 text-green-700 border-0"
                  : "bg-gray-100 text-gray-700 border-0"
              }`}
            >
              {service.is_active ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mb-3 text-xs text-momcha-text-dark">
            <span className="font-medium text-momcha-coral">{formatCurrency(service.price)}</span>
            <span className="text-momcha-text-light">•</span>
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-momcha-text-light" />
              <span>{service.duration_minutes} menit</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(service)}
              className="flex-1 h-8 text-xs text-momcha-coral border-momcha-coral"
            >
              <Edit size={12} className="mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggle(service)}
              className={`h-8 w-8 p-0 ${
                service.is_active
                  ? "text-yellow-600 border-yellow-600"
                  : "text-green-600 border-green-600"
              }`}
            >
              <Power size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(service)}
              className="h-8 w-8 p-0 text-red-600 border-red-600"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sort Column Header (Desktop) ---
function SortHeader({ label, field, sortField, sortDir, onSort }) {
  const isActive = sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 group text-xs font-medium transition-colors ${
        isActive ? "text-momcha-coral" : "text-momcha-text-dark hover:text-momcha-coral"
      }`}
    >
      {label}
      {isActive ? (
        sortDir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />
      ) : (
        <ArrowUpDown size={11} className="opacity-40 group-hover:opacity-80" />
      )}
    </button>
  );
}

const SORT_OPTIONS = [
  { field: "name", label: "Nama" },
  { field: "price", label: "Harga" },
  { field: "duration_minutes", label: "Durasi" },
  { field: "is_active", label: "Status" },
];

// --- Main Page ---
export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [reorderLoading, setReorderLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showActiveOnly]);

  async function loadServices() {
    try {
      setLoading(true);
      const params = showActiveOnly ? "?is_active=true" : "";
      const res = await api.getServices(params);
      if (res.success) setServices(res.data);
    } catch (error) {
      console.error("Load services error:", error);
      toast.error("Gagal memuat data service");
    } finally {
      setLoading(false);
    }
  }

  const filteredServices = useMemo(
    () =>
      services.filter((s) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
      }),
    [services, search],
  );

  const displayedServices = useMemo(() => {
    if (!sortField) return filteredServices;
    return [...filteredServices].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "price" || sortField === "duration_minutes" || sortField === "is_active") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = String(aVal ?? "").toLowerCase();
        bVal = String(bVal ?? "").toLowerCase();
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredServices, sortField, sortDir]);

  const isDragEnabled = !sortField && !search;

  function handleSort(field) {
    if (sortField === field) {
      if (sortDir === "asc") {
        setSortDir("desc");
      } else {
        setSortField(null);
        setSortDir("asc");
      }
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = services.findIndex((s) => s.id === active.id);
      const newIndex = services.findIndex((s) => s.id === over.id);
      const newOrder = arrayMove(services, oldIndex, newIndex);
      setServices(newOrder);

      setReorderLoading(true);
      try {
        await api.reorderServices(newOrder.map((s, i) => ({ id: s.id, sort_order: i + 1 })));
      } catch {
        toast.error("Gagal menyimpan urutan");
        loadServices();
      } finally {
        setReorderLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [services],
  );

  function resetForm() {
    setFormData({ name: "", description: "", price: "", duration_minutes: "" });
  }

  function openCreateModal() {
    resetForm();
    setShowCreateModal(true);
  }

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

  function openToggleModal(service) {
    setSelectedService(service);
    setShowToggleModal(true);
  }

  async function confirmToggle() {
    if (!selectedService) return;
    const newStatus = !selectedService.is_active;
    try {
      setActionLoading(true);
      const res = await api.updateService(selectedService.id, { is_active: newStatus });
      if (res.success) {
        toast.success(`Service berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"}!`);
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

  function openDeleteModal(service) {
    setSelectedService(service);
    setShowDeleteModal(true);
  }

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
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-momcha-text-dark">Services</h1>
          <p className="text-sm text-momcha-text-light">Kelola service yang ditawarkan</p>
        </div>
        <Button
          onClick={openCreateModal}
          className="w-full sm:w-auto bg-momcha-coral hover:bg-momcha-brown text-white text-sm h-9"
        >
          <Plus size={16} className="mr-2" />
          Tambah Service
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-momcha-peach">
        <CardContent className="pt-4 lg:pt-6 space-y-3">
          {/* Search + Active toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-momcha-text-light"
                size={16}
              />
              <Input
                placeholder="Cari service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button
              variant={showActiveOnly ? "default" : "outline"}
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              className={`h-9 text-sm ${showActiveOnly ? "bg-momcha-coral hover:bg-momcha-brown" : ""}`}
            >
              {showActiveOnly ? "Semua Service" : "Aktif Saja"}
            </Button>
          </div>

          {/* Sort buttons (mobile only) */}
          <div className="lg:hidden flex items-center gap-2 flex-wrap">
            <span className="text-xs text-momcha-text-light">Sortir:</span>
            {SORT_OPTIONS.map(({ field, label }) => (
              <Button
                key={field}
                variant="outline"
                size="sm"
                onClick={() => handleSort(field)}
                className={`h-7 text-xs px-2 flex items-center gap-1 ${
                  sortField === field ? "border-momcha-coral text-momcha-coral bg-momcha-cream" : ""
                }`}
              >
                {label}
                {sortField === field ? (
                  sortDir === "asc" ? <ArrowUp size={10} /> : <ArrowDown size={10} />
                ) : (
                  <ArrowUpDown size={10} className="opacity-40" />
                )}
              </Button>
            ))}
            {sortField && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSortField(null); setSortDir("asc"); }}
                className="h-7 text-xs text-momcha-text-light hover:text-momcha-text-dark"
              >
                Reset
              </Button>
            )}
          </div>

          {/* Drag hint */}
          <p className="text-xs text-momcha-text-light flex items-center gap-1">
            {isDragEnabled ? (
              <>
                <GripVertical size={12} />
                Seret untuk mengubah urutan tampilan
                {reorderLoading && <Loader2 size={10} className="animate-spin ml-1" />}
              </>
            ) : (
              "Hapus pencarian/sortir untuk mengubah urutan"
            )}
          </p>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card className="border-momcha-peach">
        <CardContent className="p-0">
          {loading ? (
            <TableRowsSkeleton rows={4} />
          ) : displayedServices.length === 0 ? (
            <div className="text-center py-12 text-momcha-text-light">
              <p className="text-sm">Tidak ada service yang ditemukan</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={displayedServices.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {/* MOBILE VIEW */}
                <div className="lg:hidden divide-y divide-momcha-peach">
                  {displayedServices.map((service) => (
                    <SortableCard
                      key={service.id}
                      service={service}
                      isDragEnabled={isDragEnabled}
                      onEdit={openEditModal}
                      onToggle={openToggleModal}
                      onDelete={openDeleteModal}
                    />
                  ))}
                </div>

                {/* DESKTOP VIEW */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-momcha-cream border-b border-momcha-peach">
                      <tr>
                        <th className="px-3 py-3 w-10" />
                        <th className="text-left px-4 py-3">
                          <SortHeader
                            label="Service"
                            field="name"
                            sortField={sortField}
                            sortDir={sortDir}
                            onSort={handleSort}
                          />
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-momcha-text-dark">
                          Deskripsi
                        </th>
                        <th className="text-left px-4 py-3">
                          <SortHeader
                            label="Harga"
                            field="price"
                            sortField={sortField}
                            sortDir={sortDir}
                            onSort={handleSort}
                          />
                        </th>
                        <th className="text-left px-4 py-3">
                          <SortHeader
                            label="Durasi"
                            field="duration_minutes"
                            sortField={sortField}
                            sortDir={sortDir}
                            onSort={handleSort}
                          />
                        </th>
                        <th className="text-left px-4 py-3">
                          <SortHeader
                            label="Status"
                            field="is_active"
                            sortField={sortField}
                            sortDir={sortDir}
                            onSort={handleSort}
                          />
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-momcha-text-dark">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-momcha-peach">
                      {displayedServices.map((service) => (
                        <SortableRow
                          key={service.id}
                          service={service}
                          isDragEnabled={isDragEnabled}
                          onEdit={openEditModal}
                          onToggle={openToggleModal}
                          onDelete={openDeleteModal}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Tambah Service Baru</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Isi form di bawah untuk menambah service
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium">
                Nama Service <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Pijat Laktasi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium">Deskripsi</label>
              <textarea
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-momcha-coral"
                rows="3"
                placeholder="Deskripsi singkat service"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium">
                  Harga <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="150000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium">
                  Durasi (menit) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="60"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, duration_minutes: e.target.value })
                  }
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={actionLoading}
              className="text-sm h-9"
            >
              Batal
            </Button>
            <Button
              onClick={handleCreate}
              disabled={actionLoading}
              className="bg-momcha-coral hover:bg-momcha-brown text-sm h-9"
            >
              {actionLoading ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
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
        <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Service</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update informasi service
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium">
                Nama Service <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Pijat Laktasi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium">Deskripsi</label>
              <textarea
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-momcha-coral"
                rows="3"
                placeholder="Deskripsi singkat service"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium">
                  Harga <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="150000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium">
                  Durasi (menit) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="60"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, duration_minutes: e.target.value })
                  }
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={actionLoading}
              className="text-sm h-9"
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={actionLoading}
              className="bg-momcha-coral hover:bg-momcha-brown text-sm h-9"
            >
              {actionLoading ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
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
        <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {selectedService?.is_active ? "Nonaktifkan" : "Aktifkan"} Service
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {selectedService?.is_active
                ? "Service yang dinonaktifkan tidak akan muncul di daftar order baru"
                : "Service akan muncul kembali di daftar order baru"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 sm:py-4">
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-momcha-cream rounded-lg">
              <Power
                className={`shrink-0 ${
                  selectedService?.is_active ? "text-yellow-600" : "text-green-600"
                }`}
                size={20}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-momcha-text-dark truncate">
                  {selectedService?.name}
                </p>
                <p className="text-xs text-momcha-text-light">
                  {formatCurrency(selectedService?.price)} · {selectedService?.duration_minutes} menit
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowToggleModal(false)}
              disabled={actionLoading}
              className="text-sm h-9"
            >
              Batal
            </Button>
            <Button
              onClick={confirmToggle}
              disabled={actionLoading}
              className={`text-sm h-9 ${
                selectedService?.is_active
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {actionLoading ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Power size={14} className="mr-2" />
                  {selectedService?.is_active ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Hapus Service</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              service yang dihapus tidak dapat dikembalikan
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 sm:py-4">
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-red-50 rounded-lg">
              <Trash2 className="text-red-600 shrink-0" size={20} />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-red-900 truncate">
                  {selectedService?.name}
                </p>
                <p className="text-xs text-red-700">
                  {formatCurrency(selectedService?.price)} · {selectedService?.duration_minutes} menit
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-momcha-text-light mt-3 sm:mt-4">
              ⚠️ Pastikan tidak ada order aktif menggunakan service ini
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={actionLoading}
              className="text-sm h-9"
            >
              Batal
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white text-sm h-9"
            >
              {actionLoading ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 size={14} className="mr-2" />
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
