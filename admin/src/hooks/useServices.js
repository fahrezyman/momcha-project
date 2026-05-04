import { useEffect, useState } from "react";
import { PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { api } from "@/lib/api";
import { toast } from "sonner";

const EMPTY_FORM = { name: "", description: "", price: "", duration_minutes: "" };

/**
 * useServices — state, DnD, dan CRUD logic untuk halaman daftar service.
 *
 * DnD hanya aktif ketika tidak ada search/filter aktif (isDraggable).
 * Urutan drag disimpan optimistik; rollback jika API gagal.
 *
 * @returns {object} State dan fungsi siap pakai
 */
export function useServices() {
  const [services, setServices] = useState([]);
  const [orderedServices, setOrderedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showActiveOnly]);

  useEffect(() => {
    setOrderedServices(services);
  }, [services]);

  async function loadServices() {
    try {
      setLoading(true);
      const res = await api.getServices(showActiveOnly ? "?is_active=true" : "");
      if (res.success) setServices(res.data);
    } catch {
      toast.error("Gagal memuat data service");
    } finally {
      setLoading(false);
    }
  }

  const filteredServices = orderedServices.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
  });

  // DnD only works when list is unfiltered — filtering changes order semantics
  const isDraggable = !search && !showActiveOnly;
  const displayServices = isDraggable ? orderedServices : filteredServices;

  // ── Modal openers ─────────────────────────────────────────────────────────

  function openCreateModal() {
    setFormData(EMPTY_FORM);
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

  function openToggleModal(service) {
    setSelectedService(service);
    setShowToggleModal(true);
  }

  function openDeleteModal(service) {
    setSelectedService(service);
    setShowDeleteModal(true);
  }

  // ── CRUD actions ──────────────────────────────────────────────────────────

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
        loadServices();
      } else {
        toast.error(res.error?.message || "Gagal membuat service");
      }
    } catch {
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
        loadServices();
      } else {
        toast.error(res.error?.message || "Gagal update service");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
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
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
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
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedServices.findIndex((s) => s.id === active.id);
    const newIndex = orderedServices.findIndex((s) => s.id === over.id);
    const newOrder = arrayMove(orderedServices, oldIndex, newIndex);

    // Optimistic update — rollback on failure
    setOrderedServices(newOrder);
    try {
      await api.reorderServices(newOrder.map((s) => s.id));
    } catch {
      toast.error("Gagal menyimpan urutan");
      setOrderedServices(orderedServices);
    }
  }

  return {
    displayServices, filteredServices, orderedServices,
    loading, search, setSearch, showActiveOnly, setShowActiveOnly,
    isDraggable, sensors,
    showCreateModal, setShowCreateModal,
    showEditModal, setShowEditModal,
    showToggleModal, setShowToggleModal,
    showDeleteModal, setShowDeleteModal,
    selectedService, actionLoading, formData, setFormData,
    openCreateModal, openEditModal, openToggleModal, openDeleteModal,
    handleCreate, handleUpdate, confirmToggle, confirmDelete,
    handleDragEnd,
  };
}
