"use client";

import { useCalendar } from "@/hooks/useCalendar";
import { formatCurrency, formatTime } from "@/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarOrderDetailModal } from "@/components/calendar/OrderDetailModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarSkeleton } from "@/components/skeletons";
import { eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from "date-fns";
import { id } from "date-fns/locale";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  expired: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function CalendarPage() {
  const {
    currentDate, view, setView,
    loading,
    selectedOrder, showDetailModal, setShowDetailModal,
    days, weeks,
    previousPeriod, nextPeriod, goToToday,
    getOrdersForDate, isHoliday, openOrderDetail,
  } = useCalendar();

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-momcha-text-dark">Kalender & Jadwal</h1>
          <p className="text-sm text-momcha-text-light">Lihat jadwal service</p>
        </div>
        <div className="flex items-center gap-2">
          {["week", "month"].map((v) => (
            <Button
              key={v}
              variant={view === v ? "default" : "outline"}
              size="sm"
              onClick={() => setView(v)}
              className={view === v ? "bg-momcha-coral hover:bg-momcha-brown flex-1 sm:flex-none" : "flex-1 sm:flex-none"}
            >
              {v === "week" ? "Minggu" : "Bulan"}
            </Button>
          ))}
        </div>
      </div>

      {/* Navigation */}
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
              <Button variant="outline" size="sm" onClick={goToToday} className="text-xs sm:text-sm">
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

      {/* Calendar grid */}
      {loading ? (
        <CalendarSkeleton />
      ) : view === "week" ? (
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
                    <div
                      className={`w-full sm:w-24 lg:w-28 p-2 sm:p-3 sm:border-r border-b sm:border-b-0 border-momcha-peach flex items-center justify-center ${isToday ? "bg-momcha-peach" : "bg-gray-50"}`}
                    >
                      <div className="text-center">
                        <div className="text-xs text-momcha-text-light capitalize">
                          {format(day, "EEE", { locale: id })}
                        </div>
                        <div className={`text-xl sm:text-2xl font-bold ${isToday ? "text-momcha-coral" : "text-momcha-text-dark"}`}>
                          {format(day, "d")}
                        </div>
                        <div className="text-xs text-momcha-text-light">
                          {format(day, "MMM", { locale: id })}
                        </div>
                      </div>
                    </div>
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
                              className={`w-full sm:w-auto px-2 sm:px-3 py-2 rounded-lg border transition-all hover:shadow-md ${STATUS_COLORS[order.payment_status] || STATUS_COLORS.expired}`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="text-left shrink-0">
                                  <p className="text-xs font-bold">
                                    {formatTime(order.service_start_time)}
                                  </p>
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <p className="text-xs font-semibold truncate">
                                    {order.customer_name}
                                  </p>
                                  <p className="text-xs opacity-70 truncate">{order.services_name}</p>
                                </div>
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
        <Card className="border-momcha-peach overflow-x-auto">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 min-w-160">
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day, idx) => (
                <div
                  key={day}
                  className={`p-2 text-center text-xs font-medium border-b border-momcha-peach ${idx >= 5 ? "text-red-600" : "text-momcha-text-light"}`}
                >
                  {day}
                </div>
              ))}

              {weeks.map((weekStart) => {
                const weekDays = eachDayOfInterval({
                  start: weekStart,
                  end: endOfWeek(weekStart, { weekStartsOn: 1 }),
                });

                return weekDays.map((day, dayIndex) => {
                  const dayOrders = getOrdersForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const holiday = isHoliday(day);
                  const isWeekend = dayIndex >= 5;

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-20 sm:min-h-24 p-1.5 sm:p-2 border-b border-r border-momcha-peach ${!isCurrentMonth ? "bg-gray-50" : ""} ${isToday ? "bg-momcha-cream" : ""} ${holiday ? "bg-red-50" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
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
                        {holiday && <span className="text-xs">🎌</span>}
                      </div>
                      {holiday && (
                        <p className="text-[10px] text-red-500 leading-tight truncate mb-1">
                          {holiday}
                        </p>
                      )}
                      <div className="space-y-1">
                        {dayOrders.slice(0, 2).map((order) => (
                          <button
                            key={order.id}
                            onClick={() => openOrderDetail(order)}
                            className={`w-full text-left px-1 py-0.5 rounded text-xs truncate ${STATUS_COLORS[order.payment_status] || STATUS_COLORS.expired}`}
                          >
                            <span className="font-medium">
                              {formatTime(order.service_start_time)}
                            </span>{" "}
                            <span className="hidden sm:inline">{order.customer_name}</span>
                          </button>
                        ))}
                        {dayOrders.length > 2 && (
                          <p className="text-xs text-momcha-text-light">+{dayOrders.length - 2}</p>
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
        <CardContent className="pt-4 lg:pt-6">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            {[
              { color: "bg-yellow-100 border-yellow-200", label: "Pending" },
              { color: "bg-green-100 border-green-200", label: "Lunas" },
              { color: "bg-red-100 border-red-200", label: "Cancelled" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${color} border`} />
                <span className="text-xs text-momcha-text-light">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CalendarOrderDetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        order={selectedOrder}
      />
    </div>
  );
}
