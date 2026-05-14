"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/constants";
import { Banknote, QrCode, Loader2, Check } from "lucide-react";

/**
 * PaymentModal — bidan pilih metode pembayaran setelah service selesai.
 *
 * Step "choose" → pilih Cash atau QRIS
 * Step "cash"   → konfirmasi cash
 * QRIS          → langsung buka payment link Midtrans di tab baru
 */
export function PaymentModal({
  open,
  onClose,
  order,
  paymentStep,
  onSelectMethod,
  onConfirmCash,
  loading,
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {paymentStep === "choose" ? "Pilih Metode Pembayaran" : "Konfirmasi Pembayaran Cash"}
          </DialogTitle>
        </DialogHeader>

        {/* Step: choose */}
        {paymentStep === "choose" && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-momcha-text-light text-center">
              Total:{" "}
              <span className="font-bold text-momcha-text-dark">
                {formatCurrency(order?.total_amount)}
              </span>
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => onSelectMethod("cash")}
                disabled={loading}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-momcha-peach hover:border-momcha-coral hover:bg-momcha-cream transition-colors disabled:opacity-50"
              >
                <Banknote size={28} className="text-green-600" />
                <span className="text-sm font-semibold text-momcha-text-dark">Cash</span>
              </button>
              <button
                onClick={() => onSelectMethod("qris")}
                disabled={loading}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-momcha-peach hover:border-momcha-coral hover:bg-momcha-cream transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={28} className="text-momcha-coral animate-spin" />
                ) : (
                  <QrCode size={28} className="text-momcha-coral" />
                )}
                <span className="text-sm font-semibold text-momcha-text-dark">QRIS</span>
              </button>
            </div>
          </div>
        )}

        {/* Step: cash confirmation */}
        {paymentStep === "cash" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Banknote className="text-green-600 shrink-0" size={22} />
              <div>
                <p className="text-sm font-medium text-green-900">{order?.order_number}</p>
                <p className="text-sm text-green-700">{formatCurrency(order?.total_amount)}</p>
              </div>
            </div>
            <p className="text-sm text-momcha-text-light text-center">
              Konfirmasi pembayaran cash sudah diterima?
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1 text-sm h-9"
              >
                Batal
              </Button>
              <Button
                onClick={onConfirmCash}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm h-9"
              >
                {loading ? (
                  <><Loader2 size={14} className="mr-2 animate-spin" />Memproses...</>
                ) : (
                  <><Check size={14} className="mr-2" />Konfirmasi</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
