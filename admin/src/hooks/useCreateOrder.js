import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";

/**
 * useCreateOrder — semua state dan logic untuk halaman buat order baru.
 *
 * Memisahkan: data fetching layanan, form customer (termasuk autocomplete search),
 * form layanan yang dipilih, kalkulasi total, dan submit ke API.
 *
 * @returns {object} State dan fungsi siap pakai
 */
export function useCreateOrder() {
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    service_date: new Date().toLocaleDateString("en-CA"),
    service_start_time: "",
    notes: "",
  });

  const [selectedServices, setSelectedServices] = useState([
    { service_id: "", quantity: 1, use_custom_price: false, custom_price: "" },
  ]);

  // ── Customer search ───────────────────────────────────────────────────────
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const searchTimeout = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoadingServices(true);
        const res = await api.getServices("?is_active=true");
        if (res.success) setServices(res.data);
      } catch {
        toast.error("Gagal memuat daftar layanan");
      } finally {
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCustomerSearchChange(value) {
    setCustomerSearch(value);
    setFormData((prev) => ({ ...prev, customer_name: value }));

    clearTimeout(searchTimeout.current);
    if (value.length < 2) {
      setCustomerSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        setSearchingCustomer(true);
        const res = await api.getCustomers(`?search=${encodeURIComponent(value)}&limit=5`);
        if (res.success && res.data.length > 0) {
          setCustomerSuggestions(res.data);
          setShowSuggestions(true);
        } else {
          setCustomerSuggestions([]);
          setShowSuggestions(false);
        }
      } catch {
        // silently fail — user can still type manually
      } finally {
        setSearchingCustomer(false);
      }
    }, 300);
  }

  function selectCustomer(customer) {
    setFormData((prev) => ({
      ...prev,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email || "",
      customer_address: customer.address || "",
    }));
    setCustomerSearch(customer.name);
    setShowSuggestions(false);
  }

  // ── Service rows ──────────────────────────────────────────────────────────

  function addServiceRow() {
    setSelectedServices((prev) => [
      ...prev,
      { service_id: "", quantity: 1, use_custom_price: false, custom_price: "" },
    ]);
  }

  function removeServiceRow(index) {
    if (selectedServices.length === 1) {
      toast.error("Minimal 1 layanan harus dipilih");
      return;
    }
    setSelectedServices((prev) => prev.filter((_, i) => i !== index));
  }

  function updateServiceRow(index, field, value) {
    setSelectedServices((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  // ── Computed total ────────────────────────────────────────────────────────

  function calculateTotal() {
    let total = 0;
    let duration = 0;
    selectedServices.forEach((item) => {
      if (item.service_id) {
        const service = services.find((s) => s.id === parseInt(item.service_id));
        if (service) {
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

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();

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
          ...(s.use_custom_price && s.custom_price && { custom_price: parseFloat(s.custom_price) }),
        })),
      };

      const res = await api.createOrder(payload);
      if (res.success) {
        setCreatedOrder(res.data);
        if (res.data.payment_link) {
          navigator.clipboard.writeText(res.data.payment_link);
          toast.success("Payment link disalin ke clipboard!");
        }
        toast.success("Order berhasil dibuat!");
        setShowSuccessModal(true);
      } else {
        if (res.error?.code === "SCHEDULE_CONFLICT") {
          toast.error(`Waktu bentrok dengan order: ${res.error.conflict_order?.order_number}`);
        } else {
          toast.error(res.error?.message || "Gagal membuat order");
        }
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return {
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
  };
}
