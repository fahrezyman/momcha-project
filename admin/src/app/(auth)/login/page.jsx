"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.login({ username, password });

      if (res.success) {
        login(res.data, res.data.token);
      } else {
        setError(res.error?.message || "Login gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-momcha-cream flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-momcha-peach rounded-full opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-momcha-pink rounded-full opacity-20" />
      </div>

      <Card className="w-full max-w-md shadow-lg border-0 relative z-10">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-momcha-peach flex items-center justify-center overflow-hidden">
              <Image
                src="/logo_transparent.png"
                alt="Momcha Logo"
                width={80}
                height={80}
                className="object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-momcha-text-dark">
            Momcha Admin
          </CardTitle>
          <CardDescription className="text-momcha-text-light">
            Masuk untuk mengelola layanan babycare
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-momcha-text-dark">
                Username
              </label>
              <Input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="border-momcha-peach focus:ring-momcha-coral"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-momcha-text-dark">
                Password
              </label>
              <Input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="border-momcha-peach focus:ring-momcha-coral"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-momcha-coral hover:bg-momcha-brown text-white transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Masuk...
                </span>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-momcha-text-light mt-6">
            © 2026 Momcha Babycare · All rights reserved
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
