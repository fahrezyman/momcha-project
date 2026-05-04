import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";

/**
 * useOrderDetail — semua state dan logic untuk halaman detail order.
 *
 * Memisahkan business logic dari presentasi sehingga orders/[id]/page.jsx
 * hanya bertanggung jawab merender UI.
 *
 * @param {string|number} orderId - ID order dari URL params
 * @returns {object} State dan fungsi siap pakai
 */
export function useOrderDetail(orderId) {
  const router = useRouter();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Modal visibility ──────────────────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // ── Form state ────────────────────────────────────────────────────────────
  const [completeConfirmed, setCompleteConfirmed] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [refundNotes, setRefundNotes] = useState("");
  const [editForm, setEditForm] = useState({
    services: [],
    service_date: "",
    service_start_time: "",
    notes: "",
  });

  useEffect(() => {
    if (orderId) {
      loadOrder();
      loadServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // ── Data fetching ─────────────────────────────────────────────────────────

  async function loadOrder() {
    try {
      setLoading(true);
      const res = await api.getOrder(orderId);
      if (res.success) {
        setOrder(res.data);
      } else {
        toast.error("Order tidak ditemukan");
        router.push("/orders");
      }
    } catch {
      toast.error("Gagal memuat data order");
    } finally {
      setLoading(false);
    }
  }

  async function loadServices() {
    try {
      setLoadingServices(true);
      const res = await api.getServices("?is_active=true");
      if (res.success) setServices(res.data);
    } catch {
      // Gagal muat layanan tidak kritis — edit modal akan kosong
    } finally {
      setLoadingServices(false);
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Copy payment link ke clipboard dan tampilkan feedback singkat. */
  function copyPaymentLink() {
    if (!order?.payment_link) return;
    navigator.clipboard.writeText(order.payment_link);
    setCopied(true);
    toast.success("Payment link berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  }

  /** Tandai order sebagai sudah dibayar secara manual. */
  async function markAsPaid() {
    try {
      setActionLoading(true);
      const res = await api.updateOrderStatus(orderId, "paid");
      if (res.success) {
        toast.success("Order ditandai sebagai sudah dibayar!");
        setShowMarkPaidModal(false);
        loadOrder();
      } else {
        toast.error(res.error?.message || "Gagal update status");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  /** Tandai order sebagai selesai. Hanya bisa dipanggil setelah admin mencentang konfirmasi. */
  async function markAsCompleted() {
    try {
      setActionLoading(true);
      const res = await api.updateOrderStatus(orderId, "completed");
      if (res.success) {
        toast.success("Order ditandai sebagai selesai!");
        setShowCompleteModal(false);
        setCompleteConfirmed(false);
        loadOrder();
      } else {
        toast.error(res.error?.message || "Gagal update status");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  /** Buka edit modal dan isi form dengan data order saat ini. */
  function openEditModal() {
    setEditForm({
      services: order.services?.map((s) => ({
        service_id: s.service_id,
        quantity: s.quantity,
        use_custom_price: false,
        custom_price: "",
      })) || [{ service_id: "", quantity: 1, use_custom_price: false, custom_price: "" }],
      service_date: order.service_date,
      service_start_time: order.service_start_time,
      notes: order.notes || "",
    });
    setShowEditModal(true);
  }

  /**
   * Simpan perubahan order.
   * - Perubahan layanan/catatan → PUT /orders/:id
   * - Perubahan jadwal → POST /orders/:id/reschedule (validasi bentrok di backend)
   * Keduanya bisa terjadi sekaligus dalam satu save.
   */
  async function handleEditOrder() {
    const validServices = editForm.services.filter((s) => s.service_id);

    if (validServices.length === 0) {
      toast.error("Pilih minimal 1 layanan");
      return;
    }
    if (!editForm.service_date || !editForm.service_start_time) {
      toast.error("Tanggal dan waktu wajib diisi");
      return;
    }

    const servicesChanged =
      JSON.stringify(validServices.map((s) => ({ service_id: s.service_id, quantity: s.quantity }))) !==
      JSON.stringify(order.services?.map((s) => ({ service_id: s.service_id, quantity: s.quantity })));

    const dateTimeChanged =
      editForm.service_date !== order.service_date ||
      editForm.service_start_time !== order.service_start_time;

    const notesChanged = editForm.notes !== (order.notes || "");

    if (!servicesChanged && !dateTimeChanged && !notesChanged) {
      toast.info("Tidak ada perubahan");
      setShowEditModal(false);
      return;
    }

    try {
      setActionLoading(true);

      if (servicesChanged || notesChanged) {
        const payload = {
          ...(servicesChanged && {
            services: validServices.map((s) => ({
              service_id: parseInt(s.service_id),
              quantity: parseInt(s.quantity),
              ...(s.use_custom_price && s.custom_price && { custom_price: parseFloat(s.custom_price) }),
            })),
          }),
          notes: editForm.notes,
        };

        const res = await api.updateOrder(orderId, payload);
        if (!res.success) {
          toast.error(res.error?.message || "Gagal mengubah order");
          return;
        }
      }

      if (dateTimeChanged) {
        const res = await api.rescheduleOrder(orderId, {
          new_date: editForm.service_date,
          new_time: editForm.service_start_time,
          reason: servicesChanged ? "Perubahan layanan dan jadwal" : "Perubahan jadwal",
        });

        if (!res.success) {
          if (res.error?.code === "SCHEDULE_CONFLICT") {
            toast.error(`Waktu bentrok dengan order lain: ${res.error.conflict_order?.order_number}`);
          } else {
            toast.error(res.error?.message || "Gagal mengubah jadwal");
          }
          return;
        }
      }

      toast.success("Order berhasil diubah!");
      setShowEditModal(false);
      loadOrder();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  /** Batalkan order. Validasi alasan (dan refund notes jika sudah bayar) dilakukan di sini. */
  async function handleCancel() {
    if (!cancelReason.trim()) {
      toast.error("Alasan pembatalan wajib diisi");
      return;
    }
    if (order.payment_status === "paid" && !refundNotes.trim()) {
      toast.error("Keterangan refund wajib diisi untuk order yang sudah lunas");
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.cancelOrder(
        orderId,
        cancelReason,
        order.payment_status === "paid" ? refundNotes : undefined,
      );

      if (res.success) {
        toast.success("Order berhasil dibatalkan!");
        setShowCancelModal(false);
        setCancelReason("");
        setRefundNotes("");
        loadOrder();
      } else {
        toast.error(res.error?.message || "Gagal membatalkan order");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  // ── Computed permissions ──────────────────────────────────────────────────
  // Edit hanya boleh selama belum lunas & belum selesai/batal
  const canEdit = order
    ? order.status !== "cancelled" && order.status !== "completed" && order.payment_status !== "paid"
    : false;
  const canCancel = order
    ? order.status !== "cancelled" && order.status !== "completed"
    : false;
  const canMarkPaid = order?.payment_status === "pending";
  const canComplete = order?.payment_status === "paid" && order?.status === "paid";

  return {
    // data
    order,
    loading,
    services,
    loadingServices,
    // ui
    copied,
    actionLoading,
    // modals
    showEditModal, setShowEditModal,
    showCancelModal, setShowCancelModal,
    showMarkPaidModal, setShowMarkPaidModal,
    showCompleteModal, setShowCompleteModal,
    // form
    completeConfirmed, setCompleteConfirmed,
    cancelReason, setCancelReason,
    refundNotes, setRefundNotes,
    editForm, setEditForm,
    // actions
    copyPaymentLink,
    markAsPaid,
    markAsCompleted,
    openEditModal,
    handleEditOrder,
    handleCancel,
    // permissions
    canEdit,
    canCancel,
    canMarkPaid,
    canComplete,
  };
}
