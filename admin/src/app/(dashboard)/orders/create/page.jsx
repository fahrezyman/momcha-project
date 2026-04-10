"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatCurrency } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateOrderPage() {
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    service_date: "",
    service_start_time: "",
    notes: "",
  });

  // Selected services (array)
  const [selectedServices, setSelectedServices] = useState([
    { service_id: "", quantity: 1, use_custom_price: false, custom_price: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoadingServices(true);
      const res = await api.getServices("?is_active=true");
      if (res.success) {
        setServices(res.data);
      }
    } catch (error) {
      console.error("Load services error:", error);
      toast.error("Gagal memuat daftar layanan");
    } finally {
      setLoadingServices(false);
    }
  }

  // Add service row
  function addServiceRow() {
    setSelectedServices([
      ...selectedServices,
      {
        service_id: "",
        quantity: 1,
        use_custom_price: false,
        custom_price: "",
      },
    ]);
  }

  // Remove service row
  function removeServiceRow(index) {
    if (selectedServices.length === 1) {
      toast.error("Minimal 1 layanan harus dipilih");
      return;
    }
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  }

  // Update service row
  function updateServiceRow(index, field, value) {
    const newServices = [...selectedServices];
    newServices[index][field] = value;
    setSelectedServices(newServices);
  }

  // Calculate total
  function calculateTotal() {
    let total = 0;
    let duration = 0;

    selectedServices.forEach((item) => {
      if (item.service_id) {
        const service = services.find(
          (s) => s.id === parseInt(item.service_id),
        );
        if (service) {
          // Use custom price if enabled, otherwise use service price
          const price =
            item.use_custom_price && item.custom_price
              ? parseFloat(item.custom_price)
              : service.price;

          total += price * item.quantity;
          duration += service.duration_minutes * item.quantity;
        }
      }
    });

    return { total, duration };
  }

  const { total: totalAmount, duration: totalDuration } = calculateTotal();

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    if (!formData.customer_name || !formData.customer_phone) {
      toast.error("Nama dan nomor HP customer wajib diisi");
      return;
    }

    const validServices = selectedServices.filter((s) => s.service_id);
    if (validServices.length === 0) {
      toast.error("Pilih minimal 1 layanan");
      return;
    }

    if (!formData.service_date || !formData.service_start_time) {
      toast.error("Tanggal dan waktu layanan wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        services: validServices.map((s) => ({
          service_id: parseInt(s.service_id),
          quantity: parseInt(s.quantity),
          // Send custom_price if enabled
          ...(s.use_custom_price &&
            s.custom_price && {
              custom_price: parseFloat(s.custom_price),
            }),
        })),
      };

      const res = await api.createOrder(payload);

      if (res.success) {
        setCreatedOrder(res.data);

        // Copy payment link to clipboard
        if (res.data.payment_link) {
          navigator.clipboard.writeText(res.data.payment_link);
          toast.success("Payment link disalin ke clipboard!");
        }

        toast.success("Order berhasil dibuat!");
        setShowSuccessModal(true);
      } else {
        if (res.error?.code === "SCHEDULE_CONFLICT") {
          toast.error(
            `Waktu bentrok dengan order: ${res.error.conflict_order?.order_number}`,
          );
        } else {
          toast.error(res.error?.message || "Gagal membuat order");
        }
      }
    } catch (error) {
      console.error("Create order error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

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
              Buat Order Baru
            </h1>
            <p className="text-momcha-text-light">
              Isi form untuk membuat order
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <Card className="border-momcha-peach">
          <CardHeader>
            <CardTitle className="text-momcha-text-dark">
              Informasi Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Nama customer"
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_name: e.target.value })
                  }
                  required
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
                  onChange={(e) =>
                    setFormData({ ...formData, customer_phone: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, customer_email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Alamat</label>
                <Input
                  placeholder="Alamat lengkap"
                  value={formData.customer_address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customer_address: e.target.value,
                    })
                  }
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
              <Button
                type="button"
                onClick={addServiceRow}
                variant="outline"
                size="sm"
              >
                <Plus size={16} className="mr-2" />
                Tambah Layanan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingServices ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-momcha-coral" />
              </div>
            ) : (
              <>
                {selectedServices.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-2 pb-3 border-b border-momcha-peach last:border-0"
                  >
                    <div className="flex gap-3 items-start">
                      {/* Service Select */}
                      <div className="flex-1">
                        <select
                          className="w-full px-3 py-2 border border-momcha-peach rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-momcha-coral"
                          value={item.service_id}
                          onChange={(e) =>
                            updateServiceRow(
                              index,
                              "service_id",
                              e.target.value,
                            )
                          }
                          required
                        >
                          <option value="">-- Pilih Layanan --</option>
                          {services.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name} - {formatCurrency(service.price)} (
                              {service.duration_minutes}m)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="w-24">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            updateServiceRow(index, "quantity", e.target.value)
                          }
                          required
                        />
                      </div>

                      {/* Subtotal Display */}
                      {item.service_id && !item.use_custom_price && (
                        <div className="w-32 flex items-center text-sm font-medium text-momcha-text-dark">
                          {formatCurrency(
                            (services.find(
                              (s) => s.id === parseInt(item.service_id),
                            )?.price || 0) * item.quantity,
                          )}
                        </div>
                      )}

                      {/* Remove Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeServiceRow(index)}
                        disabled={selectedServices.length === 1}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    {/* Custom Price Option */}
                    {item.service_id && (
                      <div className="flex items-center gap-3 ml-0">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.use_custom_price || false}
                            onChange={(e) => {
                              const newServices = [...selectedServices];
                              newServices[index].use_custom_price =
                                e.target.checked;
                              if (!e.target.checked) {
                                newServices[index].custom_price = "";
                              }
                              setSelectedServices(newServices);
                            }}
                            className="rounded border-momcha-peach"
                          />
                          <span className="text-momcha-text-light">
                            Custom harga
                          </span>
                        </label>

                        {item.use_custom_price && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              placeholder="Harga custom"
                              value={item.custom_price || ""}
                              onChange={(e) =>
                                updateServiceRow(
                                  index,
                                  "custom_price",
                                  e.target.value,
                                )
                              }
                              className="w-40"
                              required
                            />
                            <span className="text-sm font-medium text-momcha-coral">
                              ={" "}
                              {formatCurrency(
                                (parseFloat(item.custom_price) || 0) *
                                  item.quantity,
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Total */}
                <div className="pt-3 border-t border-momcha-peach">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-momcha-text-light">
                        Total Durasi
                      </p>
                      <p className="text-lg font-bold text-momcha-text-dark">
                        {totalDuration} menit
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-momcha-text-light">
                        Total Harga
                      </p>
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
            <CardTitle className="text-momcha-text-dark">
              Jadwal Layanan
            </CardTitle>
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
                  onChange={(e) =>
                    setFormData({ ...formData, service_date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service_start_time: e.target.value,
                    })
                  }
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
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/orders">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || totalAmount === 0}
            className="bg-momcha-coral hover:bg-momcha-brown"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              "Buat Order"
            )}
          </Button>
        </div>
      </form>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check size={24} />
              Order Berhasil Dibuat!
            </DialogTitle>
            <DialogDescription>
              Order telah dibuat dan payment link sudah disalin
            </DialogDescription>
          </DialogHeader>

          {createdOrder && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-momcha-cream rounded-lg">
                <p className="text-xs text-momcha-text-light mb-1">
                  Order Number
                </p>
                <p className="text-lg font-bold text-momcha-text-dark">
                  {createdOrder.order_number}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(createdOrder.total_amount)}
                </p>
              </div>

              {createdOrder.payment_link && (
                <div className="space-y-2">
                  <p className="text-xs text-momcha-text-light">
                    Payment Link (sudah disalin)
                  </p>
                  <div className="p-3 bg-gray-100 rounded text-xs break-all">
                    {createdOrder.payment_link}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/orders");
              }}
              className="flex-1"
            >
              Tutup
            </Button>
            <Button
              onClick={() => router.push(`/orders/${createdOrder?.order_id}`)}
              className="flex-1 bg-momcha-coral hover:bg-momcha-brown"
            >
              Lihat Detail
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
