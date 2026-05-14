import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useOrderDetail(orderId) {
  const router = useRouter();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState(false);

  // ── Modal visibility ──────────────────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // ── Payment state ─────────────────────────────────────────────────────────
  const [paymentStep, setPaymentStep] = useState("choose"); // 'choose' | 'cash'

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
  const [rescheduleForm, setRescheduleForm] = useState({
    service_date: "",
    service_start_time: "",
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

  // ── Payment ───────────────────────────────────────────────────────────────

  function openPaymentModal() {
    setPaymentStep("choose");
    setShowPaymentModal(true);
  }

  function closePaymentModal() {
    setShowPaymentModal(false);
    setPaymentStep("choose");
  }

  async function processPayment(method) {
    try {
      setActionLoading(true);
      const res = await api.processPayment(orderId, method);

      if (!res.success) {
        toast.error(res.error?.message || "Gagal memproses pembayaran");
        setPaymentStep("choose");
        return;
      }

      if (method === "cash") {
        toast.success("Pembayaran cash berhasil dicatat!");
        closePaymentModal();
        loadOrder();
        return;
      }

      // QRIS: buka payment link Midtrans di tab baru
      closePaymentModal();
      window.open(res.data.payment_link, "_blank");
    } catch {
      toast.error("Terjadi kesalahan");
      setPaymentStep("choose");
    } finally {
      setActionLoading(false);
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

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

  function openRescheduleModal() {
    setRescheduleForm({
      service_date: order.service_date,
      service_start_time: order.service_start_time,
    });
    setShowRescheduleModal(true);
  }

  async function handleReschedule() {
    if (!rescheduleForm.service_date || !rescheduleForm.service_start_time) {
      toast.error("Tanggal dan waktu wajib diisi");
      return;
    }

    const unchanged =
      rescheduleForm.service_date === order.service_date &&
      rescheduleForm.service_start_time === order.service_start_time;

    if (unchanged) {
      toast.info("Tidak ada perubahan jadwal");
      setShowRescheduleModal(false);
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.rescheduleOrder(orderId, {
        new_date: rescheduleForm.service_date,
        new_time: rescheduleForm.service_start_time,
        reason: "Perubahan jadwal",
      });

      if (res.success) {
        toast.success("Jadwal berhasil diubah!");
        setShowRescheduleModal(false);
        loadOrder();
      } else if (res.error?.code === "SCHEDULE_CONFLICT") {
        toast.error(`Waktu bentrok dengan order lain: ${res.error.conflict_order?.order_number}`);
      } else {
        toast.error(res.error?.message || "Gagal mengubah jadwal");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

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
  const canEdit = order
    ? order.status !== "cancelled" && order.status !== "completed" && order.payment_status !== "paid"
    : false;
  const canCancel = order
    ? order.status !== "cancelled" && order.status !== "completed"
    : false;
  const canProcessPayment = order?.payment_status === "pending";
  const canComplete = order?.payment_status === "paid" && order?.status === "paid";

  return {
    // data
    order,
    loading,
    services,
    loadingServices,
    // ui
    actionLoading,
    // modals
    showEditModal, setShowEditModal,
    showRescheduleModal, setShowRescheduleModal,
    showCancelModal, setShowCancelModal,
    showPaymentModal,
    showCompleteModal, setShowCompleteModal,
    // payment
    paymentStep, setPaymentStep,
    // form
    completeConfirmed, setCompleteConfirmed,
    cancelReason, setCancelReason,
    refundNotes, setRefundNotes,
    editForm, setEditForm,
    rescheduleForm, setRescheduleForm,
    // actions
    openPaymentModal,
    closePaymentModal,
    processPayment,
    markAsCompleted,
    openEditModal,
    openRescheduleModal,
    handleEditOrder,
    handleReschedule,
    handleCancel,
    // permissions
    canEdit,
    canCancel,
    canProcessPayment,
    canComplete,
  };
}
