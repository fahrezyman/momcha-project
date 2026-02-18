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

  const hd = new Holidays("ID"); // ID = Indonesia

  function isHoliday(date) {
    const holidays = hd.isHoliday(date);
    if (holidays && holidays.length > 0) {
      return holidays[0].name; // Return holiday name
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

      // Get date range based on view
      let startDate, endDate;
      if (view === "week") {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
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

  // Generate days for current view
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-momcha-text-dark">
            Kalender & Jadwal
          </h1>
          <p className="text-momcha-text-light">Lihat jadwal service</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("week")}
            className={
              view === "week" ? "bg-momcha-coral hover:bg-momcha-brown" : ""
            }
          >
            Minggu
          </Button>
          <Button
            variant={view === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("month")}
            className={
              view === "month" ? "bg-momcha-coral hover:bg-momcha-brown" : ""
            }
          >
            Bulan
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <Card className="border-momcha-peach">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={previousPeriod}>
              <ChevronLeft size={18} />
            </Button>

            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-momcha-text-dark capitalize">
                {view === "week"
                  ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM", { locale: id })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM yyyy", { locale: id })}`
                  : format(currentDate, "MMMM yyyy", { locale: id })}
              </h2>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hari Ini
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={nextPeriod}>
              <ChevronRight size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-momcha-coral" />
        </div>
      ) : view === "week" ? (
        // Week View - COMPACT
        <Card className="border-momcha-peach">
          <CardContent className="p-0">
            <div className="divide-y divide-momcha-peach">
              {days.map((day) => {
                const dayOrders = getOrdersForDate(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`flex hover:bg-momcha-cream/30 ${isToday ? "bg-momcha-cream/50" : ""}`}
                  >
                    {/* Day Label - LEFT (Compact) */}
                    <div
                      className={`w-28 p-3 border-r border-momcha-peach flex items-center justify-center ${isToday ? "bg-momcha-peach" : "bg-gray-50"}`}
                    >
                      <div className="text-center">
                        <div className="text-xs text-momcha-text-light capitalize">
                          {format(day, "EEE", { locale: id })}
                        </div>
                        <div
                          className={`text-2xl font-bold ${isToday ? "text-momcha-coral" : "text-momcha-text-dark"}`}
                        >
                          {format(day, "d")}
                        </div>
                        <div className="text-xs text-momcha-text-light">
                          {format(day, "MMM", { locale: id })}
                        </div>
                      </div>
                    </div>

                    {/* Orders - RIGHT (Compact) */}
                    <div className="flex-1 p-3 min-h-20">
                      {dayOrders.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-momcha-text-light">
                          <p className="text-xs">Tidak ada jadwal</p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {dayOrders.map((order) => (
                            <button
                              key={order.id}
                              onClick={() => openOrderDetail(order)}
                              className={`px-3 py-2 rounded-lg border transition-all hover:shadow-md ${getStatusColor(order.payment_status)}`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Time */}
                                <div className="text-left">
                                  <p className="text-xs font-bold">
                                    {formatTime(order.service_start_time)}
                                  </p>
                                </div>

                                {/* Info */}
                                <div className="text-left">
                                  <p className="text-xs font-semibold">
                                    {order.customer_name}
                                  </p>
                                  <p className="text-xs opacity-70 truncate max-w-xs">
                                    {order.services_name}
                                  </p>
                                </div>

                                {/* Amount */}
                                <div className="text-right">
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
        // Month View
        <Card className="border-momcha-peach">
          <CardContent className="p-0">
            <div className="grid grid-cols-7">
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
                  const isWeekend = dayIndex >= 5; // Sabtu & Minggu

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-24 p-2 border-b border-r border-momcha-peach ${!isCurrentMonth ? "bg-gray-50" : ""} ${isToday ? "bg-momcha-cream" : ""} ${holiday ? "bg-red-50" : ""}`}
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
                        {dayOrders.slice(0, 3).map((order) => (
                          <button
                            key={order.id}
                            onClick={() => openOrderDetail(order)}
                            className={`w-full text-left px-1 py-0.5 rounded text-xs truncate ${getStatusColor(order.payment_status)}`}
                          >
                            {formatTime(order.service_start_time)}{" "}
                            {order.customer_name}
                          </button>
                        ))}
                        {dayOrders.length > 3 && (
                          <p className="text-xs text-momcha-text-light">
                            +{dayOrders.length - 3} lainnya
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

      {/* Legend */}
      <Card className="border-momcha-peach">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200" />
              <span className="text-xs text-momcha-text-light">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-200" />
              <span className="text-xs text-momcha-text-light">Lunas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-200" />
              <span className="text-xs text-momcha-text-light">Cancelled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>Detail order</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 bg-momcha-cream rounded-lg">
                <Calendar className="text-momcha-coral" size={24} />
                <div>
                  <p className="text-sm font-medium text-momcha-text-dark">
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

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-momcha-text-light" />
                  <span className="text-sm text-momcha-text-dark">
                    {selectedOrder.customer_name}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Scissors
                    size={16}
                    className="text-momcha-text-light mt-0.5"
                  />{" "}
                  <div className="flex-1">
                    <p className="text-sm text-momcha-text-dark">
                      {selectedOrder.services_names || "-"}
                    </p>
                    {selectedOrder.services_count > 1 && (
                      <p className="text-xs text-momcha-text-light">
                        {selectedOrder.services_count} layanan
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-momcha-text-light" />
                  <span className="text-sm text-momcha-text-dark">
                    {selectedOrder.total_duration_minutes} menit total
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-momcha-text-light" />
                  <span className="text-sm font-medium text-momcha-text-dark">
                    {formatCurrency(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-momcha-text-light">
                  Status Pembayaran:
                </span>
                <Badge className={getStatusColor(selectedOrder.payment_status)}>
                  {selectedOrder.payment_status === "paid"
                    ? "Lunas"
                    : selectedOrder.payment_status === "pending"
                      ? "Pending"
                      : "Cancelled"}
                </Badge>
              </div>

              <Link href={`/orders/${selectedOrder.id}`}>
                <Button className="w-full bg-momcha-coral hover:bg-momcha-brown">
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
