const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

class API {
  constructor() {
    this.baseURL = API_URL;
  }

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

    try {
      console.log("🔍 API Request:", {
        url: `${this.baseURL}${endpoint}`,
        method: config.method || "GET",
        hasToken: !!token,
        token: token ? `${token.substring(0, 20)}...` : "none",
      });

      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      console.log("📡 API Response:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });

      const data = await response.json();

      // Auto redirect to login on 401
      if (response.status === 401 && typeof window !== "undefined") {
        console.log("❌ Unauthorized - Redirecting to login");
        localStorage.removeItem("momcha_token");
        localStorage.removeItem("momcha_admin");
        window.location.href = "/login";
        return data;
      }

      // Handle other errors
      if (!response.ok) {
        console.error("❌ API Error:", {
          status: response.status,
          data,
        });
      }

      return data;
    } catch (error) {
      console.error("❌ API Fetch Error:", error);
      throw error;
    }
  }

  // Auth
  async login(username, password) {
    return this.fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  async getMe() {
    return this.fetch("/auth/me");
  }

  async changePassword(currentPassword, newPassword) {
    return this.fetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  // Services
  async getServices(params = "") {
    return this.fetch(`/services${params}`);
  }

  async getService(id) {
    return this.fetch(`/services/${id}`);
  }

  async createService(data) {
    return this.fetch("/services", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateService(id, data) {
    return this.fetch(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteService(id) {
    return this.fetch(`/services/${id}`, {
      method: "DELETE",
    });
  }

  // Customers
  async getCustomers(params = "") {
    return this.fetch(`/customers${params}`);
  }

  async getCustomer(id) {
    return this.fetch(`/customers/${id}`);
  }

  async updateCustomer(id, data) {
    return this.fetch(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id) {
    return this.fetch(`/customers/${id}`, {
      method: "DELETE",
    });
  }

  // Orders
  async getOrders(params = "") {
    return this.fetch(`/orders${params}`);
  }

  async getOrder(id) {
    return this.fetch(`/orders/${id}`);
  }

  async createOrder(data) {
    return this.fetch("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(id, status) {
    return this.fetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async rescheduleOrder(id, data) {
    return this.fetch(`/orders/${id}/reschedule`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateOrder(id, data) {
    return this.fetch(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async cancelOrder(id, reason) {
    return this.fetch(`/orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  // Settings
  async getSettings() {
    return this.fetch("/settings");
  }

  async updateSettings(data) {
    return this.fetch("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

export const api = new API();
