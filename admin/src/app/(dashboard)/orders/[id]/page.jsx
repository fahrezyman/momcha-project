"use client";

import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useRouter, useParams } from "next/navigation";
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
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  Clock,
  User,
  MapPin,
  Mail,
  Phone,
  Printer,
  Scissors,
  DollarSign,
  CreditCard,
  FileText,
  X,
  Loader2,
  Edit,
  Plus,
  Trash2,
  FileDown,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // Services list
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Edit form (multiple services + reschedule)
  const [editForm, setEditForm] = useState({
    services: [],
    service_date: "",
    service_start_time: "",
    notes: "",
  });

  // Cancel form
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (orderId) {
      loadOrder();
      loadServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // For printing invoice &  Add print function
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

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
    } catch (error) {
      console.error("Load order error:", error);
      toast.error("Gagal memuat data order");
    } finally {
      setLoading(false);
    }
  }

  async function loadServices() {
    try {
      setLoadingServices(true);
      const res = await api.getServices("?is_active=true");
      if (res.success) {
        setServices(res.data);
      }
    } catch (error) {
      console.error("Load services error:", error);
    } finally {
      setLoadingServices(false);
    }
  }

  function copyPaymentLink() {
    if (order?.payment_link) {
      navigator.clipboard.writeText(order.payment_link);
      setCopied(true);
      toast.success("Payment link berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Mark as Paid
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
    } catch (error) {
      console.error("Mark as paid error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  // Mark as Completed
  async function markAsCompleted() {
    try {
      setActionLoading(true);
      const res = await api.updateOrderStatus(orderId, "completed");

      if (res.success) {
        toast.success("Order ditandai sebagai selesai!");
        setShowCompleteModal(false);
        loadOrder();
      } else {
        toast.error(res.error?.message || "Gagal update status");
      }
    } catch (error) {
      console.error("Mark as completed error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  // Open Edit Modal
  function openEditModal() {
    setEditForm({
      services: order.services?.map((s) => ({
        service_id: s.service_id,
        quantity: s.quantity,
        use_custom_price: false,
        custom_price: "",
      })) || [
        {
          service_id: "",
          quantity: 1,
          use_custom_price: false,
          custom_price: "",
        },
      ],
      service_date: order.service_date,
      service_start_time: order.service_start_time,
      notes: order.notes || "",
    });
    setShowEditModal(true);
  }

  // Submit Edit Order
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

    try {
      setActionLoading(true);

      // Check what changed
      const servicesChanged =
        JSON.stringify(
          validServices.map((s) => ({
            service_id: s.service_id,
            quantity: s.quantity,
          })),
        ) !==
        JSON.stringify(
          order.services?.map((s) => ({
            service_id: s.service_id,
            quantity: s.quantity,
          })),
        );

      const dateTimeChanged =
        editForm.service_date !== order.service_date ||
        editForm.service_start_time !== order.service_start_time;

      const notesChanged = editForm.notes !== (order.notes || "");

      if (!servicesChanged && !dateTimeChanged && !notesChanged) {
        toast.info("Tidak ada perubahan");
        setShowEditModal(false);
        setActionLoading(false);
        return;
      }

      // Step 1: Update services and/or notes if changed
      if (servicesChanged || notesChanged) {
        const updatePayload = {
          // Only send services array when services actually changed to avoid
          // unnecessary Midtrans transaction recreation
          ...(servicesChanged && {
            services: validServices.map((s) => ({
              service_id: parseInt(s.service_id),
              quantity: parseInt(s.quantity),
              ...(s.use_custom_price &&
                s.custom_price && {
                  custom_price: parseFloat(s.custom_price),
                }),
            })),
          }),
          notes: editForm.notes,
        };

        const updateRes = await api.updateOrder(orderId, updatePayload);

        if (!updateRes.success) {
          toast.error(updateRes.error?.message || "Gagal mengubah order");
          setActionLoading(false);
          return;
        }
      }

      // Step 2: Reschedule if date/time changed
      if (dateTimeChanged) {
        const reschedulePayload = {
          new_date: editForm.service_date,
          new_time: editForm.service_start_time,
          reason: servicesChanged
            ? "Perubahan layanan dan jadwal"
            : "Perubahan jadwal",
        };

        const rescheduleRes = await api.rescheduleOrder(
          orderId,
          reschedulePayload,
        );

        if (!rescheduleRes.success) {
          if (rescheduleRes.error?.code === "SCHEDULE_CONFLICT") {
            toast.error(
              `Waktu bentrok dengan order lain: ${rescheduleRes.error.conflict_order?.order_number}`,
            );
          } else {
            toast.error(
              rescheduleRes.error?.message || "Gagal mengubah jadwal",
            );
          }
          setActionLoading(false);
          return;
        }
      }

      // Success
      toast.success("Order berhasil diubah!");
      setShowEditModal(false);
      loadOrder();
    } catch (error) {
      console.error("Edit order error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  // Submit Cancel
  async function handleCancel() {
    if (!cancelReason.trim()) {
      toast.error("Alasan pembatalan wajib diisi");
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.cancelOrder(orderId, cancelReason);

      if (res.success) {
        toast.success("Order berhasil dibatalkan!");
        setShowCancelModal(false);
        loadOrder();
      } else {
        toast.error(res.error?.message || "Gagal membatalkan order");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  }

  function getStatusBadge(status) {
    const statusData = ORDER_STATUS[status] || { label: status, color: "gray" };
    return (
      <Badge className={`${STATUS_BADGE_COLORS[statusData.color]} border`}>
        {statusData.label}
      </Badge>
    );
  }

  function getPaymentBadge(status) {
    const statusData = PAYMENT_STATUS[status] || { label: status, color: "gray" };
    return (
      <Badge className={`${STATUS_BADGE_COLORS[statusData.color]} border`}>
        {statusData.label}
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-momcha-coral" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-momcha-text-light">Order tidak ditemukan</p>
      </div>
    );
  }

  const canEdit = order.status !== "cancelled" && order.status !== "completed";
  const canCancel =
    order.status !== "cancelled" && order.status !== "completed";
  const canMarkPaid = order.payment_status === "pending";
  const canComplete =
    order.payment_status === "paid" && order.status === "paid";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={18} className="mr-2" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-momcha-text-dark">
              {order.order_number}
            </h1>
            <p className="text-momcha-text-light text-sm">
              Dibuat {formatDate(order.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-momcha-peach">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-momcha-text-light mb-1">
                  Status Pembayaran
                </p>
                {getPaymentBadge(order.payment_status)}
              </div>
              <CreditCard className="text-momcha-coral" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-momcha-peach">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-momcha-text-light mb-1">
                  Status Order
                </p>
                {getStatusBadge(order.status)}
              </div>
              <FileText className="text-momcha-pink" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card className="border-momcha-peach">
            <CardHeader>
              <CardTitle className="text-momcha-text-dark flex items-center gap-2">
                <User size={20} className="text-momcha-coral" />
                Informasi Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={18} className="text-momcha-text-light mt-0.5" />
                <div>
                  <p className="text-xs text-momcha-text-light">Nama</p>
                  <p className="text-sm font-medium text-momcha-text-dark">
                    {order.customer_name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-momcha-text-light mt-0.5" />
                <div>
                  <p className="text-xs text-momcha-text-light">Nomor HP</p>
                  <p className="text-sm font-medium text-momcha-text-dark">
                    {order.customer_phone}
                  </p>
                </div>
              </div>

              {order.customer_email && (
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-momcha-text-light mt-0.5" />
                  <div>
                    <p className="text-xs text-momcha-text-light">Email</p>
                    <p className="text-sm font-medium text-momcha-text-dark">
                      {order.customer_email}
                    </p>
                  </div>
                </div>
              )}

              {order.customer_address && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-momcha-text-light mt-0.5" />
                  <div>
                    <p className="text-xs text-momcha-text-light">Alamat</p>
                    <p className="text-sm font-medium text-momcha-text-dark">
                      {order.customer_address}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Info */}
          <Card className="border-momcha-peach">
            <CardHeader>
              <CardTitle className="text-momcha-text-dark flex items-center gap-2">
                <Scissors size={20} className="text-momcha-pink" />
                Layanan ({order.services?.length || 0} items)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Services List */}
              {order.services && order.services.length > 0 ? (
                <div className="space-y-3">
                  {order.services.map((svc, index) => (
                    <div
                      key={svc.id}
                      className="flex items-start gap-3 p-3 bg-momcha-cream rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-momcha-peach flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-momcha-brown">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-momcha-text-dark">
                          {svc.service_name}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-momcha-text-light">
                          <span>
                            {formatCurrency(svc.price)} x {svc.quantity}
                          </span>
                          <span>•</span>
                          <span>{svc.duration_minutes}m per sesi</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-momcha-coral">
                          {formatCurrency(svc.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Total Summary */}
                  <div className="pt-3 border-t border-momcha-peach">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-momcha-text-light">
                          Total Durasi
                        </p>
                        <p className="text-sm font-bold text-momcha-text-dark">
                          {order.total_duration_minutes} menit
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-momcha-text-light">
                          Total Harga
                        </p>
                        <p className="text-lg font-bold text-momcha-coral">
                          {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-momcha-text-light text-center py-4">
                  Tidak ada layanan
                </p>
              )}

              {/* Schedule Info */}
              <div className="pt-3 border-t border-momcha-peach space-y-2">
                <div className="flex items-start gap-3">
                  <Calendar
                    size={18}
                    className="text-momcha-text-light mt-0.5"
                  />
                  <div>
                    <p className="text-xs text-momcha-text-light">Tanggal</p>
                    <p className="text-sm font-medium text-momcha-text-dark">
                      {formatDate(order.service_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-momcha-text-light mt-0.5" />
                  <div>
                    <p className="text-xs text-momcha-text-light">Waktu</p>
                    <p className="text-sm font-medium text-momcha-text-dark">
                      {formatTime(order.service_start_time)} (
                      {order.total_duration_minutes} menit total)
                    </p>
                  </div>
                </div>

                {order.notes && (
                  <div className="flex items-start gap-3">
                    <FileText
                      size={18}
                      className="text-momcha-text-light mt-0.5"
                    />
                    <div>
                      <p className="text-xs text-momcha-text-light">Catatan</p>
                      <p className="text-sm font-medium text-momcha-text-dark">
                        {order.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Payment Info */}
          <Card className="border-momcha-peach">
            <CardHeader>
              <CardTitle className="text-momcha-text-dark flex items-center gap-2">
                <DollarSign size={20} className="text-green-600" />
                Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-momcha-text-light mb-1">
                  Total Harga
                </p>
                <p className="text-2xl font-bold text-momcha-text-dark">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>

              {order.payment_link && (
                <div className="space-y-2">
                  <p className="text-xs text-momcha-text-light">Payment Link</p>
                  <Button
                    onClick={copyPaymentLink}
                    className="w-full bg-momcha-coral hover:bg-momcha-brown text-white"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="mr-2" />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-2" />
                        Copy Payment Link
                      </>
                    )}
                  </Button>
                </div>
              )}

              {canMarkPaid && (
                <Button
                  onClick={() => setShowMarkPaidModal(true)}
                  disabled={actionLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check size={16} className="mr-2" />
                  Tandai Sudah Bayar
                </Button>
              )}

              {order.paid_at && (
                <div>
                  <p className="text-xs text-momcha-text-light">Dibayar pada</p>
                  <p className="text-sm font-medium text-green-600">
                    {formatDate(order.paid_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-momcha-peach">
            <CardHeader>
              <CardTitle className="text-momcha-text-dark text-sm">
                Pengaturan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Print Invoice - NEW */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => generateInvoicePDF(order)}
              >
                <FileDown size={16} className="mr-2" />
                Download Invoice PDF
              </Button>
              {/* Edit Order */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={openEditModal}
                disabled={!canEdit || actionLoading}
              >
                <Edit size={16} className="mr-2" />
                Edit Order
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowCompleteModal(true)}
                disabled={!canComplete || actionLoading}
              >
                <Check size={16} className="mr-2" />
                Tandai Selesai
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setShowCancelModal(true)}
                disabled={!canCancel || actionLoading}
              >
                <X size={16} className="mr-2" />
                Cancel Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Order Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>
              Ubah layanan, tanggal, atau waktu
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Services */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Layanan</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditForm({
                      ...editForm,
                      services: [
                        ...editForm.services,
                        {
                          service_id: "",
                          quantity: 1,
                          use_custom_price: false,
                          custom_price: "",
                        },
                      ],
                    });
                  }}
                >
                  <Plus size={14} className="mr-1" />
                  Tambah
                </Button>
              </div>

              {loadingServices ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2
                    size={20}
                    className="animate-spin text-momcha-coral"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {editForm.services?.map((item, index) => (
                    <div
                      key={index}
                      className="space-y-2 pb-3 border-b border-momcha-peach last:border-0"
                    >
                      <div className="flex gap-2 items-start">
                        {/* Service Select */}
                        <select
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                          value={item.service_id}
                          onChange={(e) => {
                            const newServices = [...editForm.services];
                            newServices[index].service_id = e.target.value;
                            setEditForm({ ...editForm, services: newServices });
                          }}
                          required
                        >
                          <option value="">-- Pilih Layanan --</option>
                          {services.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name} - {formatCurrency(service.price)}
                            </option>
                          ))}
                        </select>

                        {/* Quantity */}
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => {
                            const newServices = [...editForm.services];
                            newServices[index].quantity = e.target.value;
                            setEditForm({ ...editForm, services: newServices });
                          }}
                          className="w-20"
                          required
                        />

                        {/* Remove */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (editForm.services.length === 1) {
                              toast.error("Minimal 1 layanan");
                              return;
                            }
                            const newServices = editForm.services.filter(
                              (_, i) => i !== index,
                            );
                            setEditForm({ ...editForm, services: newServices });
                          }}
                          className="text-red-600"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      {/* Custom Price */}
                      {item.service_id && (
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.use_custom_price || false}
                              onChange={(e) => {
                                const newServices = [...editForm.services];
                                newServices[index].use_custom_price =
                                  e.target.checked;
                                if (!e.target.checked) {
                                  newServices[index].custom_price = "";
                                }
                                setEditForm({
                                  ...editForm,
                                  services: newServices,
                                });
                              }}
                              className="rounded"
                            />
                            <span className="text-momcha-text-light">
                              Custom harga
                            </span>
                          </label>

                          {item.use_custom_price && (
                            <Input
                              type="number"
                              min="0"
                              placeholder="Harga custom"
                              value={item.custom_price || ""}
                              onChange={(e) => {
                                const newServices = [...editForm.services];
                                newServices[index].custom_price =
                                  e.target.value;
                                setEditForm({
                                  ...editForm,
                                  services: newServices,
                                });
                              }}
                              className="w-32"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={editForm.service_date}
                onChange={(e) =>
                  setEditForm({ ...editForm, service_date: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Waktu <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                value={editForm.service_start_time}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    service_start_time: e.target.value,
                  })
                }
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Catatan</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                rows="2"
                placeholder="Catatan tambahan (opsional)"
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
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
              onClick={handleEditOrder}
              disabled={actionLoading}
              className="bg-momcha-coral hover:bg-momcha-brown"
            >
              {actionLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Modal */}
      <Dialog open={showMarkPaidModal} onOpenChange={setShowMarkPaidModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
            <DialogDescription>
              Tandai order ini sebagai sudah dibayar?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Check className="text-green-600" size={24} />
              <div>
                <p className="text-sm font-medium text-green-900">
                  {order?.order_number}
                </p>
                <p className="text-sm text-green-700">
                  {formatCurrency(order?.total_amount)}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMarkPaidModal(false)}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              onClick={markAsPaid}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {actionLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Check size={16} className="mr-2" />
                  Ya, Tandai Sudah Bayar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Completed Modal */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tandai Selesai</DialogTitle>
            <DialogDescription>
              Order ini akan ditandai sebagai selesai
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Check className="text-blue-600" size={24} />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {order?.order_number}
                </p>
                <p className="text-xs text-blue-700">
                  {order.services?.length} layanan
                </p>
                <p className="text-xs text-blue-700">
                  {formatDate(order?.service_date)} ·{" "}
                  {formatTime(order?.service_start_time)}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCompleteModal(false)}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              onClick={markAsCompleted}
              disabled={actionLoading}
              className="bg-momcha-coral hover:bg-momcha-brown"
            >
              {actionLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Check size={16} className="mr-2" />
                  Ya, Tandai Selesai
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Order yang dibatalkan tidak dapat dikembalikan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Alasan Pembatalan <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                rows="4"
                placeholder="Contoh: Customer request cancel, double booking, dll"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleCancel}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Cancel Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
