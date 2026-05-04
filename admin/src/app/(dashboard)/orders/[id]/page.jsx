"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { formatCurrency, formatDate, formatTime } from "@/constants";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { InfoRow } from "@/components/ui/InfoRow";
import { EditOrderModal } from "@/components/orders/EditOrderModal";
import { CancelOrderModal } from "@/components/orders/CancelOrderModal";
import { MarkPaidModal } from "@/components/orders/MarkPaidModal";
import { CompleteOrderModal } from "@/components/orders/CompleteOrderModal";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderDetailSkeleton } from "@/components/skeletons";
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
  Scissors,
  DollarSign,
  CreditCard,
  FileText,
  X,
  Edit,
  FileDown,
} from "lucide-react";

export default function OrderDetailPage() {
  const { id: orderId } = useParams();

  const {
    order, loading,
    services, loadingServices,
    copied, actionLoading,
    showEditModal, setShowEditModal,
    showCancelModal, setShowCancelModal,
    showMarkPaidModal, setShowMarkPaidModal,
    showCompleteModal, setShowCompleteModal,
    completeConfirmed, setCompleteConfirmed,
    cancelReason, setCancelReason,
    refundNotes, setRefundNotes,
    editForm, setEditForm,
    copyPaymentLink,
    markAsPaid,
    markAsCompleted,
    openEditModal,
    handleEditOrder,
    handleCancel,
    canEdit, canCancel, canMarkPaid, canComplete,
  } = useOrderDetail(orderId);

  if (loading) return <OrderDetailSkeleton />;

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-momcha-text-light">Order tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-momcha-text-dark truncate">
            {order.order_number}
          </h1>
          <p className="text-xs sm:text-sm text-momcha-text-light">
            Dibuat {formatDate(order.created_at)}
          </p>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="border-momcha-peach">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs text-momcha-text-light mb-1">Status Pembayaran</p>
                <PaymentStatusBadge status={order.payment_status} bordered />
              </div>
              <CreditCard className="text-momcha-coral hidden sm:block" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-momcha-peach">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs text-momcha-text-light mb-1">Status Order</p>
                <OrderStatusBadge status={order.status} bordered />
              </div>
              <FileText className="text-momcha-pink hidden sm:block" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Customer info */}
          <Card className="border-momcha-peach">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg text-momcha-text-dark flex items-center gap-2">
                <User size={18} className="text-momcha-coral" />
                Informasi Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <InfoRow icon={User} label="Nama">{order.customer_name}</InfoRow>
              <InfoRow icon={Phone} label="Nomor HP">{order.customer_phone}</InfoRow>
              {order.customer_email && (
                <InfoRow icon={Mail} label="Email">
                  <span className="truncate block">{order.customer_email}</span>
                </InfoRow>
              )}
              {order.customer_address && (
                <InfoRow icon={MapPin} label="Alamat">{order.customer_address}</InfoRow>
              )}
            </CardContent>
          </Card>

          {/* Service info */}
          <Card className="border-momcha-peach">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg text-momcha-text-dark flex items-center gap-2">
                <Scissors size={18} className="text-momcha-pink" />
                Layanan ({order.services?.length || 0} items)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.services?.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {order.services.map((svc, index) => (
                    <div
                      key={svc.id}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-momcha-cream rounded-lg"
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-momcha-peach flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-momcha-brown">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-momcha-text-dark">
                          {svc.service_name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 sm:mt-1 text-xs text-momcha-text-light">
                          <span>{formatCurrency(svc.price)} x {svc.quantity}</span>
                          <span>•</span>
                          <span>{svc.duration_minutes}m per sesi</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-bold text-momcha-coral">
                          {formatCurrency(svc.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Totals */}
                  <div className="pt-2 sm:pt-3 border-t border-momcha-peach">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-momcha-text-light">Total Durasi</p>
                        <p className="text-xs sm:text-sm font-bold text-momcha-text-dark">
                          {order.total_duration_minutes} menit
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-momcha-text-light">Total Harga</p>
                        <p className="text-base sm:text-lg font-bold text-momcha-coral">
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

              {/* Schedule */}
              <div className="pt-2 sm:pt-3 border-t border-momcha-peach space-y-2">
                <InfoRow icon={Calendar} label="Tanggal">{formatDate(order.service_date)}</InfoRow>
                <InfoRow icon={Clock} label="Waktu">
                  {formatTime(order.service_start_time)} ({order.total_duration_minutes} menit total)
                </InfoRow>
                {order.notes && (
                  <InfoRow icon={FileText} label="Catatan">{order.notes}</InfoRow>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4 lg:space-y-6">
          {/* Payment info */}
          <Card className="border-momcha-peach">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg text-momcha-text-dark flex items-center gap-2">
                <DollarSign size={18} className="text-green-600" />
                Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs text-momcha-text-light mb-1">Total Harga</p>
                <p className="text-xl sm:text-2xl font-bold text-momcha-text-dark">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>

              {order.payment_link && (
                <div className="space-y-2">
                  <p className="text-xs text-momcha-text-light">Payment Link</p>
                  <Button
                    onClick={copyPaymentLink}
                    className="w-full bg-momcha-coral hover:bg-momcha-brown text-white text-sm h-9"
                  >
                    {copied ? (
                      <><Check size={14} className="mr-2" />Tersalin!</>
                    ) : (
                      <><Copy size={14} className="mr-2" />Copy Payment Link</>
                    )}
                  </Button>
                </div>
              )}

              {canMarkPaid && (
                <Button
                  onClick={() => setShowMarkPaidModal(true)}
                  disabled={actionLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm h-9"
                >
                  <Check size={14} className="mr-2" />
                  Tandai Sudah Bayar
                </Button>
              )}

              {order.paid_at && (
                <div>
                  <p className="text-xs text-momcha-text-light">Dibayar pada</p>
                  <p className="text-xs sm:text-sm font-medium text-green-600">
                    {formatDate(order.paid_at)}
                  </p>
                </div>
              )}

              {order.status === "cancelled" && order.notes?.includes("[Refund Manual]") && (
                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg space-y-1">
                  <p className="text-xs font-medium text-blue-800">Keterangan Refund</p>
                  <p className="text-xs text-blue-700">
                    {order.notes
                      .split("\n")
                      .find((l) => l.startsWith("[Refund Manual]"))
                      ?.replace("[Refund Manual] ", "")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-momcha-peach">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg text-momcha-text-dark">
                Pengaturan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-sm h-9"
                onClick={() => generateInvoicePDF(order).catch(console.error)}
              >
                <FileDown size={14} className="mr-2" />
                Download Invoice PDF
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-sm h-9"
                onClick={openEditModal}
                disabled={!canEdit || actionLoading}
              >
                <Edit size={14} className="mr-2" />
                Edit Order
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-sm h-9"
                onClick={() => setShowCompleteModal(true)}
                disabled={!canComplete || actionLoading}
              >
                <Check size={14} className="mr-2" />
                Tandai Selesai
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 text-sm h-9"
                onClick={() => setShowCancelModal(true)}
                disabled={!canCancel || actionLoading}
              >
                <X size={14} className="mr-2" />
                Cancel Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <EditOrderModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditOrder}
        editForm={editForm}
        onEditFormChange={setEditForm}
        services={services}
        loadingServices={loadingServices}
        loading={actionLoading}
      />

      <MarkPaidModal
        open={showMarkPaidModal}
        onClose={() => setShowMarkPaidModal(false)}
        onConfirm={markAsPaid}
        order={order}
        loading={actionLoading}
      />

      <CompleteOrderModal
        open={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={markAsCompleted}
        order={order}
        loading={actionLoading}
        confirmed={completeConfirmed}
        onConfirmedChange={setCompleteConfirmed}
      />

      <CancelOrderModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        order={order}
        loading={actionLoading}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        refundNotes={refundNotes}
        onRefundNotesChange={setRefundNotes}
      />
    </div>
  );
}
