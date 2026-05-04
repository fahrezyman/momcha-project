const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * API — wrapper tipis di atas fetch untuk semua request ke backend.
 *
 * Fitur:
 * - Otomatis sertakan Bearer token dari localStorage
 * - Auto redirect ke /login pada 401
 * - Content-Type: application/json sudah disertakan di setiap request
 */
class API {
  constructor() {
    this.baseURL = API_URL;
  }

  /**
   * Request dasar. Semua method lain memanggil ini.
   *
   * @param {string} endpoint  - Path relatif, contoh "/orders"
   * @param {object} [options] - RequestInit options (method, body, headers, dll)
   * @returns {Promise<object>} Parsed JSON response
   */
  async fetch(endpoint, options = {}) {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("momcha_token")
        : null;

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "bypass-tunnel-reminder": "true",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    const data = await response.json();

    // Sesi habis → bersihkan storage dan redirect ke login
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("momcha_token");
      localStorage.removeItem("momcha_admin");
      window.location.href = "/login";
    }

    return data;
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  /** @param {string} username @param {string} password */
  async login(username, password) {
    return this.fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  /** Ambil data admin yang sedang login. */
  async getMe() {
    return this.fetch("/auth/me");
  }

  /** @param {string} currentPassword @param {string} newPassword */
  async changePassword(currentPassword, newPassword) {
    return this.fetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  // ── Services ──────────────────────────────────────────────────────────────

  /** @param {string} [params] - Query string, contoh "?is_active=true" */
  async getServices(params = "") {
    return this.fetch(`/services${params}`);
  }

  async getService(id) {
    return this.fetch(`/services/${id}`);
  }

  async createService(data) {
    return this.fetch("/services", { method: "POST", body: JSON.stringify(data) });
  }

  async updateService(id, data) {
    return this.fetch(`/services/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  async deleteService(id) {
    return this.fetch(`/services/${id}`, { method: "DELETE" });
  }

  /**
   * Update urutan tampil layanan.
   * @param {number[]} ids - Array ID layanan sesuai urutan baru
   */
  async reorderServices(ids) {
    return this.fetch("/services/reorder", { method: "PUT", body: JSON.stringify({ ids }) });
  }

  // ── Customers ─────────────────────────────────────────────────────────────

  /** @param {string} [params] - Query string, contoh "?search=budi&page=1" */
  async getCustomers(params = "") {
    return this.fetch(`/customers${params}`);
  }

  async getCustomer(id) {
    return this.fetch(`/customers/${id}`);
  }

  async updateCustomer(id, data) {
    return this.fetch(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  async deleteCustomer(id) {
    return this.fetch(`/customers/${id}`, { method: "DELETE" });
  }

  // ── Orders ────────────────────────────────────────────────────────────────

  /** @param {string} [params] - Query string, contoh "?status=paid&page=2" */
  async getOrders(params = "") {
    return this.fetch(`/orders${params}`);
  }

  async getOrder(id) {
    return this.fetch(`/orders/${id}`);
  }

  async createOrder(data) {
    return this.fetch("/orders", { method: "POST", body: JSON.stringify(data) });
  }

  /**
   * Update status order (paid, completed, dll).
   * @param {string|number} id
   * @param {string} status
   */
  async updateOrderStatus(id, status) {
    return this.fetch(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  }

  /**
   * Reschedule order — mencatat history dan validasi bentrok jadwal di backend.
   * @param {string|number} id
   * @param {{ new_date: string, new_time: string, reason: string }} data
   */
  async rescheduleOrder(id, data) {
    return this.fetch(`/orders/${id}/reschedule`, { method: "POST", body: JSON.stringify(data) });
  }

  /** Update layanan/catatan order (tidak termasuk jadwal — gunakan rescheduleOrder). */
  async updateOrder(id, data) {
    return this.fetch(`/orders/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  /**
   * Batalkan order.
   * @param {string|number} id
   * @param {string} reason        - Alasan pembatalan (wajib)
   * @param {string} [refundNotes] - Keterangan refund (wajib jika order sudah lunas)
   */
  async cancelOrder(id, reason, refundNotes) {
    return this.fetch(`/orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason, refund_notes: refundNotes }),
    });
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  async getSettings() {
    return this.fetch("/settings");
  }

  async updateSettings(data) {
    return this.fetch("/settings", { method: "PUT", body: JSON.stringify(data) });
  }
}

export const api = new API();
