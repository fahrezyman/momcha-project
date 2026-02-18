"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();

  // Initialize with null (sama di server & client)
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load dari localStorage di client side
  useEffect(() => {
    const savedToken = localStorage.getItem("momcha_token");
    const savedAdmin = localStorage.getItem("momcha_admin");

    if (savedToken && savedAdmin) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setToken(savedToken);
      setAdmin(JSON.parse(savedAdmin));
    }

    setLoading(false);
  }, []);

  function login(adminData, adminToken) {
    setAdmin(adminData);
    setToken(adminToken);
    localStorage.setItem("momcha_token", adminToken);
    localStorage.setItem("momcha_admin", JSON.stringify(adminData));
    router.push("/dashboard");
  }

  function logout() {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("momcha_token");
    localStorage.removeItem("momcha_admin");
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
