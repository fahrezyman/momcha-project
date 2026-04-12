"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency, formatTime } from "@/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Holidays from "date-holidays";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  DollarSign,
  Scissors,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarSkeleton } from "@/components/skeletons";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachWeekOfInterval,
  startOfDay,
} from "date-fns";
import { id } from "date-fns/locale";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("week"); // 'week' or 'month'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const hd = new Holidays("ID");

  function isHoliday(date) {
    const holidays = hd.isHoliday(date);
    if (holidays && holidays.length > 0) {
      return holidays[0].name;
    }
    return null;
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, view]);

  async function loadOrders() {
    try {
      setLoading(true);

      let startDate, endDate;
      if (view === "week") {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      } else {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      }

      const params = `?date_from=${format(startDate, "yyyy-MM-dd")}&date_to=${format(endDate, "yyyy-MM-dd")}`;
      const res = await api.getOrders(params);

      if (res.success) {
        setOrders(res.data);
      }
    } catch (error) {
      console.error("Load orders error:", error);
      toast.error("Gagal memuat jadwal");
    } finally {
      setLoading(false);
    }
  }

  function previousPeriod() {
    if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  }

  function nextPeriod() {
    if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function getOrdersForDate(date) {
    return orders
      .filter((order) => isSameDay(parseISO(order.service_date), date))
      .sort((a, b) => a.service_start_time.localeCompare(b.service_start_time));
  }

  function getStatusColor(paymentStatus) {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      expired: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[paymentStatus] || "bg-gray-100 text-gray-800 border-gray-200";
  }

  function openOrderDetail(order) {
    setSelectedOrder(order);
    setShowDetailModal(true);
  }

  const days =
    view === "week"
      ? eachDayOfInterval({
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 }),
        })
      : eachDayOfInterval({
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        });

  const weeks =
    view === "month"
      ? eachWeekOfInterval(
          {
            start: startOfMonth(currentDate),
            end: endOfMonth(currentDate),
          },
          { weekStartsOn: 1 },
        )
      : [];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-momcha-text-dark">
            Kalender & Jadwal
          </h1>
          <p className="text-sm text-momcha-text-light">Lihat jadwal service</p>
        </div>

        {/* View Toggle - Responsive */}
        <div className="flex items-center gap-2">
          <Button
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("week")}
            className={
              view === "week"
                ? "bg-momcha-coral hover:bg-momcha-brown flex-1 sm:flex-none"
                : "flex-1 sm:flex-none"
            }
          >
            Minggu
          </Button>
          <Button
            variant={view === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("month")}
            className={
              view === "month"
                ? "bg-momcha-coral hover:bg-momcha-brown flex-1 sm:flex-none"
                : "flex-1 sm:flex-none"
            }
          >
            Bulan
          </Button>
        </div>
      </div>

      {/* Navigation - Responsive */}
      <Card className="border-momcha-peach">
        <CardContent className="pt-4 lg:pt-6">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPeriod}
              className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
            >
              <ChevronLeft size={18} />
            </Button>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 flex-1">
              <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-momcha-text-dark capitalize text-center">
                {view === "week"
                  ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM", { locale: id })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM yyyy", { locale: id })}`
                  : format(currentDate, "MMMM yyyy", { locale: id })}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="text-xs sm:text-sm"
              >
                Hari Ini
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextPeriod}
              className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      {loading ? (
        <CalendarSkeleton />
      ) : view === "week" ? (
        // Week View - Responsive
        <Card className="border-momcha-peach overflow-hidden">
          <CardContent className="p-0">
            <div className="divide-y divide-momcha-peach">
              {days.map((day) => {
                const dayOrders = getOrdersForDate(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`flex flex-col sm:flex-row hover:bg-momcha-cream/30 ${isToday ? "bg-momcha-cream/50" : ""}`}
                  >
                    {/* Day Label - Responsive */}
                    <div
                      className={`w-full sm:w-24 lg:w-28 p-2 sm:p-3 sm:border-r border-b sm:border-b-0 border-momcha-peach flex items-center justify-center ${isToday ? "bg-momcha-peach" : "bg-gray-50"}`}
                    >
                      <div className="text-center">
                        <div className="text-xs text-momcha-text-light capitalize">
                          {format(day, "EEE", { locale: id })}
                        </div>
                        <div
                          className={`text-xl sm:text-2xl font-bold ${isToday ? "text-momcha-coral" : "text-momcha-text-dark"}`}
                        >
                          {format(day, "d")}
                        </div>
                        <div className="text-xs text-momcha-text-light">
                          {format(day, "MMM", { locale: id })}
                        </div>
                      </div>
                    </div>

                    {/* Orders - Responsive */}
                    <div className="flex-1 p-2 sm:p-3 min-h-16 sm:min-h-20">
                      {dayOrders.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-momcha-text-light">
                          <p className="text-xs">Tidak ada jadwal</p>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                          {dayOrders.map((order) => (
                            <button
                              key={order.id}
                              onClick={() => openOrderDetail(order)}
                              className={`w-full sm:w-auto px-2 sm:px-3 py-2 rounded-lg border transition-all hover:shadow-md ${getStatusColor(order.payment_status)}`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                {/* Time */}
                                <div className="text-left shrink-0">
                                  <p className="text-xs font-bold">
                                    {formatTime(order.service_start_time)}
                                  </p>
                                </div>

                                {/* Info */}
                                <div className="text-left flex-1 min-w-0">
                                  <p className="text-xs font-semibold truncate">
                                    {order.customer_name}
                                  </p>
                                  <p className="text-xs opacity-70 truncate">
                                    {order.services_name}
                                  </p>
                                </div>

                                {/* Amount */}
                                <div className="text-right shrink-0 hidden sm:block">
                                  <p className="text-xs font-bold whitespace-nowrap">
                                    {formatCurrency(order.total_amount)}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Month View - Responsive
        <Card className="border-momcha-peach overflow-x-auto">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 min-w-160">
              {/* Day Headers */}
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(
                (day, idx) => (
                  <div
                    key={day}
                    className={`p-2 text-center text-xs font-medium border-b border-momcha-peach ${idx >= 5 ? "text-red-600" : "text-momcha-text-light"}`}
                  >
                    {day}
                  </div>
                ),
              )}

              {/* Days */}
              {weeks.map((weekStart) => {
                const weekDays = eachDayOfInterval({
                  start: weekStart,
                  end: endOfWeek(weekStart, { weekStartsOn: 1 }),
                });

                return weekDays.map((day, dayIndex) => {
                  const dayOrders = getOrdersForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth =
                    day.getMonth() === currentDate.getMonth();
                  const holiday = isHoliday(day);
                  const isWeekend = dayIndex >= 5;

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-20 sm:min-h-24 p-1.5 sm:p-2 border-b border-r border-momcha-peach ${!isCurrentMonth ? "bg-gray-50" : ""} ${isToday ? "bg-momcha-cream" : ""} ${holiday ? "bg-red-50" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div
                          className={`text-xs font-medium ${
                            holiday || isWeekend
                              ? "text-red-600"
                              : isToday
                                ? "text-momcha-coral"
                                : isCurrentMonth
                                  ? "text-momcha-text-dark"
                                  : "text-momcha-text-light"
                          }`}
                        >
                          {format(day, "d")}
                        </div>
                        {holiday && (
                          <div className="text-xs text-red-600" title={holiday}>
                            🎌
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayOrders.slice(0, 2).map((order) => (
                          <button
                            key={order.id}
                            onClick={() => openOrderDetail(order)}
                            className={`w-full text-left px-1 py-0.5 rounded text-xs truncate ${getStatusColor(order.payment_status)}`}
                          >
                            <span className="font-medium">
                              {formatTime(order.service_start_time)}
                            </span>{" "}
                            <span className="hidden sm:inline">
                              {order.customer_name}
                            </span>
                          </button>
                        ))}
                        {dayOrders.length > 2 && (
                          <p className="text-xs text-momcha-text-light">
                            +{dayOrders.length - 2}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend - Responsive */}
      <Card className="border-momcha-peach">
        <CardContent className="pt-4 lg:pt-6">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-yellow-100 border border-yellow-200" />
              <span className="text-xs text-momcha-text-light">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-100 border border-green-200" />
              <span className="text-xs text-momcha-text-light">Lunas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-100 border border-red-200" />
              <span className="text-xs text-momcha-text-light">Cancelled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Modal - Responsive */}
      {/* Order Detail Modal - Fixed Centering */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Detail order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-3 sm:space-y-4 py-2 sm:py-4 max-h-[70vh] overflow-y-auto">
              {/* Date Card */}
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-momcha-cream rounded-lg">
                <Calendar className="text-momcha-coral shrink-0" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-momcha-text-dark">
                    {format(
                      parseISO(selectedOrder.service_date),
                      "EEEE, d MMMM yyyy",
                      { locale: id },
                    )}
                  </p>
                  <p className="text-xs text-momcha-text-light">
                    {formatTime(selectedOrder.service_start_time)} (
                    {selectedOrder.service_duration_minutes} menit)
                  </p>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-3">
                {/* Customer */}
                <div className="flex items-start gap-2">
                  <User
                    size={16}
                    className="text-momcha-text-light shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-momcha-text-light mb-0.5">
                      Customer
                    </p>
                    <p className="text-xs sm:text-sm text-momcha-text-dark font-medium">
                      {selectedOrder.customer_name}
                    </p>
                  </div>
                </div>

                {/* Services */}
                <div className="flex items-start gap-2">
                  <Scissors
                    size={16}
                    className="text-momcha-text-light shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-momcha-text-light mb-0.5">
                      Layanan
                    </p>
                    <p className="text-xs sm:text-sm text-momcha-text-dark">
                      {selectedOrder.services_names || "-"}
                    </p>
                    {selectedOrder.services_count > 1 && (
                      <p className="text-xs text-momcha-text-light mt-0.5">
                        {selectedOrder.services_count} layanan
                      </p>
                    )}
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-start gap-2">
                  <Clock
                    size={16}
                    className="text-momcha-text-light shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-momcha-text-light mb-0.5">
                      Durasi
                    </p>
                    <p className="text-xs sm:text-sm text-momcha-text-dark">
                      {selectedOrder.total_duration_minutes} menit
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-start gap-2">
                  <DollarSign
                    size={16}
                    className="text-momcha-text-light shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-momcha-text-light mb-0.5">
                      Total
                    </p>
                    <p className="text-sm sm:text-base font-bold text-momcha-coral">
                      {formatCurrency(selectedOrder.total_amount)}
                    </p>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="flex items-start gap-2 pt-2 border-t border-momcha-peach">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-momcha-text-light mb-1.5">
                      Status Pembayaran
                    </p>
                    <Badge
                      className={`${getStatusColor(selectedOrder.payment_status)} text-xs`}
                    >
                      {selectedOrder.payment_status === "paid"
                        ? "Lunas"
                        : selectedOrder.payment_status === "pending"
                          ? "Pending"
                          : "Cancelled"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link href={`/orders/${selectedOrder.id}`} className="block pt-2">
                <Button className="w-full bg-momcha-coral hover:bg-momcha-brown text-sm h-10">
                  Lihat Detail Order
                </Button>
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
