"use client";

import { useCreateOrder } from "@/hooks/useCreateOrder";
import { formatCurrency } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServicePickerRow } from "@/components/orders/ServicePickerRow";
import { CustomerSearchInput } from "@/components/orders/CustomerSearchInput";
import { OrderSuccessModal } from "@/components/orders/OrderSuccessModal";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { ServicePickerSkeleton } from "@/components/skeletons";

export default function CreateOrderPage() {
  const {
    services, loadingServices,
    loading,
    showSuccessModal, setShowSuccessModal,
    createdOrder,
    formData, setFormData,
    selectedServices,
    customerSearch, customerSuggestions, showSuggestions, searchingCustomer,
    suggestionsRef,
    totalAmount, totalDuration,
    router,
    handleCustomerSearchChange,
    selectCustomer,
    setShowSuggestions,
    addServiceRow, removeServiceRow, updateServiceRow,
    handleSubmit,
  } = useCreateOrder();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={18} className="mr-2" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-momcha-text-dark">Buat Order Baru</h1>
          <p className="text-momcha-text-light">Isi form untuk membuat order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <Card className="border-momcha-peach">
          <CardHeader>
            <CardTitle className="text-momcha-text-dark">Informasi Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <CustomerSearchInput
                  value={customerSearch || formData.customer_name}
                  onChange={handleCustomerSearchChange}
                  onFocus={() => customerSuggestions.length > 0 && setShowSuggestions(true)}
                  suggestions={customerSuggestions}
                  showSuggestions={showSuggestions}
                  onSelect={selectCustomer}
                  searching={searchingCustomer}
                  suggestionsRef={suggestionsRef}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nomor HP <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="08123456789"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alamat</label>
                <Input
                  placeholder="Alamat lengkap"
                  value={formData.customer_address}
                  onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="border-momcha-peach">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-momcha-text-dark">Layanan</CardTitle>
              <Button type="button" onClick={addServiceRow} variant="outline" size="sm">
                <Plus size={16} className="mr-2" />
                Tambah Layanan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingServices ? (
              <ServicePickerSkeleton />
            ) : (
              <>
                {selectedServices.map((item, index) => (
                  <ServicePickerRow
                    key={index}
                    item={item}
                    index={index}
                    services={services}
                    onChange={(field, value) => updateServiceRow(index, field, value)}
                    onRemove={() => removeServiceRow(index)}
                    canRemove={selectedServices.length > 1}
                    size="md"
                  />
                ))}
                <div className="pt-3 border-t border-momcha-peach">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-momcha-text-light">Total Durasi</p>
                      <p className="text-lg font-bold text-momcha-text-dark">{totalDuration} menit</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-momcha-text-light">Total Harga</p>
                      <p className="text-2xl font-bold text-momcha-coral">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="border-momcha-peach">
          <CardHeader>
            <CardTitle className="text-momcha-text-dark">Jadwal Layanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.service_date}
                  onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                  min={new Date().toLocaleDateString("en-CA")}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Waktu Mulai <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={formData.service_start_time}
                  onChange={(e) => setFormData({ ...formData, service_start_time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Catatan</label>
              <textarea
                className="w-full px-3 py-2 border border-momcha-peach rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-momcha-coral"
                rows="3"
                placeholder="Catatan tambahan (opsional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/orders">
            <Button type="button" variant="outline">Batal</Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || totalAmount === 0}
            className="bg-momcha-coral hover:bg-momcha-brown"
          >
            {loading ? (
              <><Loader2 size={16} className="mr-2 animate-spin" />Memproses...</>
            ) : (
              "Buat Order"
            )}
          </Button>
        </div>
      </form>

      <OrderSuccessModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/orders");
        }}
        onViewDetail={() => router.push(`/orders/${createdOrder?.order_id}`)}
        order={createdOrder}
      />
    </div>
  );
}
